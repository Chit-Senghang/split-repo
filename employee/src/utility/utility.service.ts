import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOperator,
  In,
  IsNull,
  QueryRunner,
  Raw,
  Repository
} from 'typeorm';
import { nanoid } from 'nanoid';
import { USER_MPATH_PREFIX } from '../shared-resources/cache/cache-constants';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { GrpcService } from '../grpc/grpc.service';
import { RequestWorkflowTypeService } from '../request-workflow-type/request-workflow-type.service';
import { RequestApprovalWorkflowService } from '../request-approval-workflow/request-approval-workflow.service';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { Employee } from '../employee/entity/employee.entity';
import { MediaService } from '../media/media.service';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { Media } from '../media/entities/media.entity';
import { CreateApprovalStatusTrackingDto } from '../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { TypeEnum } from '../request-approval-workflow/common/ts/enum/type.enum';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { RequestApprovalWorkflowLevel } from '../request-approval-workflow/entities/request-approval-workflow-level.entity';
import { NotificationService } from '../notification/notification.service';
import { RequestWorkFlowType } from '../request-workflow-type/entities/request-workflow-type.entity';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { CacheService } from '../cache/cache.service';
import { ActionTypeEnum } from '../approval-status-tracking/common/ts/enum/action-type.enum';
import { FirebaseService } from '../firebase/firebase.service';
import { IFirebaseMessage } from '../firebase/dto/firebase-payload.dto';
import { Notification } from '../notification/entities/notification.entity';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { ReasonTemplate } from '../reason-template/entities/reason-template.entity';
import { ReasonTemplateTypeEnum } from '../reason-template/common/ts/enum/type.enum';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { IMediaRepository } from '../media/repository/interface/media.repository.interface';
import { MediaRepository } from '../media/repository/media.repository';
import { EmployeeActiveStatusEnum } from '../employee/enum/employee-status.enum';
import { REQUEST_APPROVAL_WORKFLOW_RELATIONSHIP } from './constant/request-approval-workflow-relationship.constant';

type FilterEmployee = {
  employeeId: number;
  employeeIds: number[];
};

@Injectable()
export class UtilityService {
  private readonly FILE_SIZE = 'limit-upload-media-size';

  constructor(
    @Inject(MediaRepository)
    private readonly mediaRepository: IMediaRepository,
    @InjectRepository(RequestApprovalWorkflowLevel)
    private readonly requestApprovalWorkflowLevel: Repository<RequestApprovalWorkflowLevel>,
    @InjectRepository(ApprovalStatus)
    private readonly approvalStatus: Repository<ApprovalStatus>,
    private readonly grpcService: GrpcService,
    private readonly requestWorkflowTypeService: RequestWorkflowTypeService,
    private readonly requestApprovalWorkflowService: RequestApprovalWorkflowService,
    private readonly mediaService: MediaService,
    private readonly notificationService: NotificationService,
    @Inject(CacheService)
    private readonly cacheService: CacheService,
    private readonly firebaseService: FirebaseService,
    private readonly dataSource: DataSource,
    private readonly employeeRepository: EmployeeRepository
  ) {}

  async handleSearchByEmployeeCreatedBy(
    createdByUserId: number,
    createdByEmployeeId: number
  ) {
    let createdByCondition = createdByUserId as unknown as
      | FindOperator<number>
      | number;

    if (createdByEmployeeId && createdByUserId) {
      const employee =
        await this.employeeRepository.getEmployeeByIdForQuery(createdByUserId);

      createdByCondition = Raw(
        (createdBy) =>
          `(${createdBy} = '${employee?.userId}' AND ${createdBy} = '${createdByUserId}')`
      );
    } else if (createdByEmployeeId) {
      const employee =
        await this.employeeRepository.getEmployeeByIdForQuery(
          createdByEmployeeId
        );
      createdByCondition = employee.userId;
    }

    return createdByCondition;
  }

  async getCurrentUserMpath(employeeId: number): Promise<number[]> {
    const userId = getCurrentUserFromContext();
    await this.grpcService.updateEmployeeMpath(userId);
    const employeeIds: any = await this.cacheService.getUserMpath();
    return this.handleFilterByEmployeeId({ employeeId, employeeIds });
  }

  async deleteUserMpathUnderOutlet(employeeId: number) {
    const employee: Employee =
      await this.employeeRepository.getEmployeeById(employeeId);
    const companyStructureOutletIds: number[] =
      this.getEmployeeOutlets(employee);
    const keys: string[] = await this.getEmployeeInsideOutletByOutletIds(
      companyStructureOutletIds
    );

    if (keys) {
      await this.cacheService.deleteUserMpath(keys);
    }
  }

  checkIsAdmin = async () => {
    const userId = getCurrentUserFromContext();
    const user = await this.grpcService.getUserById(userId);
    return !user.isSelfService;
  };

  validateWithWorkflow = async (
    employee: Employee,
    requestType: RequestWorkFlowTypeEnum
  ) => {
    //check if request workflow type is exist
    const requestWorkflowType: RequestWorkFlowType =
      await this.requestWorkflowTypeService.FindOneByType(requestType);

    const requestApprovalWorkflow =
      await this.requestApprovalWorkflowService.getRequestApprovalWorkflowByWorkflowType(
        requestWorkflowType,
        employee
      );

    return {
      workflowTypeId: requestWorkflowType.id,
      requestApprovalWorkflowId: requestApprovalWorkflow.requestWorkflow.id,
      requesterPosition: requestApprovalWorkflow.requesterPosition
    };
  };

  checkCurrentEmployeeWithRecord = async (data: any) => {
    const userId = getCurrentUserFromContext();
    const result = [];
    const user = await this.grpcService.getUserById(userId);

    if (!user.isSelfService) {
      return data;
    }

    const currentEmployee =
      await this.employeeRepository.getEmployeeOfCurrentUser();

    currentEmployee.positions.forEach((position: EmployeePosition) => {
      result.push(this.checkMpath(position, data, currentEmployee.id));
    });

    return result.flat(1).filter((data: any) => {
      if (data !== null) {
        return data;
      }
    });
  };

  checkMpath = (
    position: EmployeePosition,
    data: any,
    currentEmployeeId: number
  ) => {
    const employeeMpath = position.mpath.split('.').splice(0, 4);
    let positionIndex: number;
    position.mpath.split('.').forEach((value: string, index: number) => {
      if (value.includes('L')) {
        positionIndex = index;
      }
    });

    const currentPositionLevel = position.mpath
      .split('.')
      .slice(positionIndex, position.mpath.length);

    const currentTeam = position.mpath.split('.').slice(4, positionIndex);
    return data.map((value: any) => {
      if (value.employee || value.employeeId) {
        const employeeId = value.employee
          ? value.employee.id
          : value.employeeId.id;
        if (currentEmployeeId === employeeId) {
          return value;
        }

        const recordMpath =
          value.position?.mpath ??
          value.employee?.mpath ??
          value.employeeId?.mpath;

        const recordMpathTeam = recordMpath.split('.').slice(0, 4);
        let positionIndex: number;
        recordMpath.split('.').map((value: string, index: number) => {
          if (value.includes('L')) {
            positionIndex = index;
          }
        });

        const positionLevel = recordMpath
          .split('.')
          .slice(positionIndex, recordMpath.length);

        const recordTeam = recordMpath.split('.').slice(4, positionIndex);

        let isTheSameTeam = false;
        employeeMpath.forEach((value: string, index: number) => {
          if (value === recordMpathTeam[index]) {
            isTheSameTeam = true;
          } else {
            isTheSameTeam = false;
            return isTheSameTeam;
          }
        });
        if (isTheSameTeam) {
          if (currentTeam.length === recordTeam.length) {
            const result = this.checkTeamInMpath(currentTeam, recordTeam);

            let isBiggerLevel = false;
            if (result) {
              isBiggerLevel = this.checkPositionInMpath(
                currentPositionLevel,
                positionLevel
              );
            }

            if (isBiggerLevel) {
              return value;
            }
          } else if (currentTeam.length < recordTeam.length) {
            const result = this.checkTeamInMpath(currentTeam, recordTeam);

            if (result) {
              return value;
            }
          }
        }
      }
    });
  };

  checkPositionInMpath = (
    currentPositionLevel: string[],
    positionLevel: string[]
  ) => {
    if (currentPositionLevel.length === 2) {
      if (currentPositionLevel[0].slice(1, 2) > positionLevel[0].slice(1, 2)) {
        return true;
      } else if (
        currentPositionLevel[0].slice(1, 2) < positionLevel[0].slice(1, 2)
      ) {
        return false;
      } else if (positionLevel[1]) {
        return currentPositionLevel[1] > positionLevel[1];
      } else {
        return true;
      }
    } else {
      return currentPositionLevel[0].slice(1, 2) > positionLevel[0].slice(1, 2);
    }
  };

  checkTeamInMpath = (employeeMpath: string[], recordMpathTeam: string[]) => {
    const status = employeeMpath.map((mpath: string, index: number) => {
      return mpath === recordMpathTeam[index];
    });
    return !status.includes(false);
  };

  getMpathFromEmployeePosition = (
    employeePosition: EmployeePosition[]
  ): string[] => {
    return employeePosition
      .map((position: EmployeePosition) => {
        return position.mpath;
      })
      .filter((data: string) => data);
  };

  validateMpath = (recordMpath: string[], currentEmployeeMpath: string[]) => {
    let isAllowed = false;
    currentEmployeeMpath.forEach((employeeMpath: string) => {
      if (!isAllowed) {
        const result = this.separateMpath(employeeMpath);
        recordMpath.forEach((recordMpath: string) => {
          const mpath = this.separateMpath(recordMpath);

          let isTheSameStructure = false;
          result.structure.forEach((structure: string, index: number) => {
            if (structure === mpath.structure[index]) {
              isTheSameStructure = true;
            }
          });

          if (isTheSameStructure) {
            const isTheSameTeam = this.checkTeamInMpath(
              result.teamStructure,
              mpath.teamStructure
            );
            if (isTheSameTeam) {
              isAllowed = this.checkPositionInMpath(
                result.positionLevel,
                mpath.positionLevel
              );
            }
          }
        });
      }
    });
    return isAllowed;
  };

  separateMpath = (mpath: string) => {
    const structure: string[] = mpath.split('.').slice(0, 4);
    let positionIndex: number;
    mpath.split('.').forEach((value: string, index: number) => {
      if (value.includes('L')) {
        positionIndex = index;
      }
    });

    const positionLevel = mpath.split('.').slice(positionIndex, mpath.length);

    const teamStructure = mpath.split('.').slice(4, positionIndex);

    return { structure, positionLevel, teamStructure };
  };

  createFilePath(fileName: string, filePath?: string) {
    return this.mediaService.createFilePath(fileName, filePath);
  }

  createNewFileNameWithExtension(
    filename: string,
    originalName: string
  ): string {
    const filenameArray = originalName.split('.');
    const extension = filenameArray.pop();
    return `${filename + '.' + extension}`;
  }

  async validateFileSize(fileSize: number) {
    const globalConfiguration =
      await this.grpcService.getGlobalConfigurationByName({
        name: this.FILE_SIZE
      });

    let defaultSize = Number(globalConfiguration.value);
    defaultSize = defaultSize * 1048576;

    if (fileSize > defaultSize) {
      throw new ResourceConflictException(
        'file size',
        'file size reached the limit!'
      );
    }
    return fileSize;
  }

  createFileName(): string {
    return nanoid();
  }

  async getMedia(id: number, type: MediaEntityTypeEnum) {
    return await this.mediaRepository.findOne({
      where: { entityId: id, entityType: type }
    });
  }

  async updateMediaEntityIdAndType(
    documentIds: number[],
    entityId: number,
    entityType: MediaEntityTypeEnum,
    queryRunner: QueryRunner
  ) {
    const deletedDocumentIds: number[] = await this.findDeletedMediaByIds(
      entityId,
      entityType,
      documentIds
    );

    if (deletedDocumentIds?.length) {
      const isDeleted =
        await this.mediaService.deleteMultipleFiles(deletedDocumentIds);
      if (isDeleted) {
        await this.mediaRepository.deleteMediaByDocumentIds(deletedDocumentIds);
      }
    }

    if (documentIds.length) {
      const updatedDocumentIds: number[] =
        (await this.findUpdatedMediaByIds(documentIds)) ?? documentIds;
      await Promise.all(
        updatedDocumentIds.map(async (documentId) => {
          const mediaInfo =
            await this.mediaRepository.findOneIfExist(documentId);
          return await queryRunner.manager.save(
            Object.assign(mediaInfo, { entityId, entityType })
          );
        })
      );
    }
  }

  async findDeletedMediaByIds(
    entityId: number,
    entityType: MediaEntityTypeEnum,
    documentIds: number[]
  ): Promise<number[]> {
    const deletedDocumentIdObjects: Media[] =
      await this.mediaRepository.findAllDeletedMediaId(
        entityId,
        entityType,
        documentIds
      );
    return deletedDocumentIdObjects.map(
      (deletedDocumentIdObject) => deletedDocumentIdObject.id
    );
  }

  async findUpdatedMediaByIds(documentIds: number[]): Promise<number[]> {
    const UpdatedDocumentIdObjects: Media[] =
      await this.mediaRepository.findAllUpdatedMediaId(documentIds);
    let updatedDocumentIds: number[];
    if (UpdatedDocumentIdObjects.length) {
      updatedDocumentIds = UpdatedDocumentIdObjects.map(
        (toUpdateDocumentIdObject) => toUpdateDocumentIdObject.id
      );
    }
    return updatedDocumentIds;
  }

  async createApprovalStatus(
    createApprovalStatus: CreateApprovalStatusTrackingDto,
    employeePosition: EmployeePosition,
    employeeId: number
  ): Promise<ApprovalStatus> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const approvalStatus: ApprovalStatus = queryRunner.manager.create(
        ApprovalStatus,
        {
          requestToUpdateChanges: createApprovalStatus.requestToUpdateChange,
          entityId: createApprovalStatus.entityId,
          requestApprovalWorkflow: {
            id: createApprovalStatus.approvalWorkflowId
          },
          requestWorkflowType: {
            id: createApprovalStatus.requestWorkflowTypeId
          },
          employeeInfo: createApprovalStatus.employeeInfo,
          employee: { id: employeeId },
          status: createApprovalStatus.status,
          requestToUpdateBy: createApprovalStatus.requestToUpdateBy,
          requestToUpdateJson: createApprovalStatus.requestToUpdateJson,
          requestChangeOriginalJson:
            createApprovalStatus.requestChangeOriginalJson
        }
      );

      const newApprovalStatus = await this.approvalStatus.save(approvalStatus);

      await this.checkEmployeesInWorkflow(
        employeePosition,
        createApprovalStatus.approvalWorkflowId,
        newApprovalStatus.id,
        TypeEnum.FIRST_APPROVALS
      );
      await queryRunner.commitTransaction();
      return newApprovalStatus;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleSendingNotification(
    requester: Employee,
    employees: Employee[],
    requestWorkflowType: RequestWorkFlowType,
    approvalStatusId: number
  ) {
    const type = requestWorkflowType.requestType.includes('_')
      ? requestWorkflowType.requestType.replace('_', ' ').toLowerCase()
      : requestWorkflowType.requestType.toLowerCase();
    const title = {
      name: requester.displayFullNameEn,
      content: `has created ${type}`
    };

    for (const employee of employees) {
      if (employee?.userId && requester?.id !== employee.id) {
        const notification: Notification =
          await this.notificationService.findOneByUserIdAndApprovalStatusId(
            approvalStatusId,
            employee.userId
          );

        if (!notification) {
          await this.notificationService.create({
            title: JSON.stringify(title),
            userId: employee.userId,
            entityId: null,
            entityType: requestWorkflowType.requestType,
            approvalStatusId: approvalStatusId,
            description: null
          });

          //send notification using firebase cloud messaging
          const payload: IFirebaseMessage = {
            topic: employee?.userId.toString(),
            notification: {
              title: title.name,
              body: title.content
            }
          };
          this.firebaseService.sendMessage(payload);
        }
      }
    }
  }

  async checkEmployeesInWorkflow(
    employeePosition: EmployeePosition,
    requestApprovalWorkflowId: number,
    approvalStatusId: number,
    type: TypeEnum,
    creatorEmployee?: Employee
  ): Promise<void> {
    //GET: request approval workflow level of fist approvers.
    const requestApprovalWorkflowLevels: RequestApprovalWorkflowLevel[] =
      await this.getRequestApprovalWorkflowLevelByRequestWorkflowId(
        requestApprovalWorkflowId,
        type
      );

    const whereCondition = {
      id: employeePosition.employee.id,
      positions: { id: employeePosition.id, isMoved: false }
    };

    const employee: Employee =
      await this.employeeRepository.getOneEmployeeByProvidedCondition(
        whereCondition
      );

    if (employeePosition) {
      let companyStructureDepartment: CompanyStructure;
      let positionLevel: PositionLevel;

      const teamIds = [];
      for (const requestApprovalWorkflowLevel of requestApprovalWorkflowLevels) {
        //CASE: not cross department
        if (!requestApprovalWorkflowLevel.companyStructureDepartment) {
          companyStructureDepartment =
            employeePosition.companyStructureDepartment;
          positionLevel = requestApprovalWorkflowLevel.positionLevel;

          this.getEmployeeNestedTeamId(employee, teamIds);
        } else {
          //CASE: cross department
          companyStructureDepartment =
            requestApprovalWorkflowLevel.companyStructureDepartment;
          (positionLevel = requestApprovalWorkflowLevel.positionLevel),
            teamIds.push(requestApprovalWorkflowLevel.companyStructureTeam.id);
        }

        //GET: employee in workflow
        const employeesInWorkflow: Employee[] =
          await this.getEmployeesInWorkflow(
            companyStructureDepartment,
            positionLevel,
            teamIds,
            requestApprovalWorkflowLevel
          );

        if (creatorEmployee) {
          employeePosition.employee = creatorEmployee;
        }

        if (employeesInWorkflow?.length) {
          //send notification to employees in workflow
          await this.handleSendingNotification(
            employeePosition.employee,
            employeesInWorkflow,
            requestApprovalWorkflowLevel.requestApprovalWorkflow
              .requestWorkflowType,
            approvalStatusId
          );
          return;
        }
      }
    }
  }

  getEmployeeMatchedWithWorkflow(
    employees: Employee[],
    requestApprovalWorkflowLevel: RequestApprovalWorkflowLevel
  ): Employee[] {
    const employeesInWorkflow = [];

    employees.forEach((employee: Employee) => {
      employee.positions.forEach((position: EmployeePosition) => {
        if (
          position.companyStructurePosition.positionLevelId.id ===
          requestApprovalWorkflowLevel.positionLevel.id
        ) {
          employeesInWorkflow.push(employee);
        }
      });
    });

    return employeesInWorkflow;
  }

  async findEmployeesBaseOnDepartmentAndPositionLevel(
    employeeDepartment: CompanyStructure,
    employeePositionLevel: PositionLevel,
    teamIds: number[]
  ): Promise<Employee[]> {
    const whereCondition = {
      positions: {
        isMoved: false,
        companyStructureDepartment: {
          id: employeeDepartment?.id
        },
        companyStructurePosition: {
          positionLevelId: {
            id: employeePositionLevel.id
          }
        },
        companyStructureTeam: {
          id: In(teamIds)
        }
      }
    };
    return await this.employeeRepository.getAllEmployeeByProvidedCondition(
      whereCondition
    );
  }

  async getRequestApprovalWorkflowLevelByRequestWorkflowId(
    workflowId: number,
    type: TypeEnum
  ): Promise<RequestApprovalWorkflowLevel[]> {
    return await this.requestApprovalWorkflowLevel.find({
      where: {
        requestApprovalWorkflow: { id: workflowId },
        type
      },
      relations: REQUEST_APPROVAL_WORKFLOW_RELATIONSHIP
    });
  }

  async deleteApprovalStatusRecordByEntityId(
    entityId: number,
    type: RequestWorkFlowTypeEnum,
    queryRunner: QueryRunner
  ): Promise<void> {
    const workflowType: RequestWorkFlowType =
      await this.requestWorkflowTypeService.FindOneByType(type);

    const approvalStatus: ApprovalStatus = await this.approvalStatus.findOneBy({
      entityId,
      requestWorkflowType: { id: workflowType.id }
    });

    if (!approvalStatus) {
      throw new ResourceNotFoundException(
        'approval status with entity id',
        entityId
      );
    }

    await queryRunner.manager.softDelete(ApprovalStatus, {
      id: approvalStatus.id
    });
  }

  checkActionType(type: TypeEnum): ActionTypeEnum {
    switch (type) {
      case TypeEnum.FIRST_APPROVALS:
      case TypeEnum.SECOND_APPROVALS:
        return ActionTypeEnum['APPROVAL/REJECT'];
      case TypeEnum.ACKNOWLEDGERS:
        return ActionTypeEnum.ACKNOWLEDGE;
      default:
        return ActionTypeEnum.NO;
    }
  }

  handleFilterByEmployeeId(filterEmployee: FilterEmployee): number[] {
    const { employeeId, employeeIds }: FilterEmployee = filterEmployee;
    if (!employeeId && !employeeIds?.length) {
      return [];
    }

    if (employeeId) {
      if (!employeeIds?.length || !employeeIds?.includes(+employeeId)) {
        return [];
      }

      return [+employeeId];
    }

    return employeeIds;
  }

  async checkCurrentUserLoginWithESSUser() {
    const getAllUserIdNull = [];
    const userId = getCurrentUserFromContext();
    const user = await this.grpcService.getUserById(userId);
    const isAdmin = await this.checkIsAdmin();
    let employeeId: Employee;
    if (isAdmin) {
      const whereCondition = {
        userId: IsNull()
      };
      const allEmployeeAdmin =
        await this.employeeRepository.getAllEmployeeByProvidedCondition(
          whereCondition
        );

      for (const employeeId of allEmployeeAdmin) {
        getAllUserIdNull.push(employeeId.id);
      }
    } else if (!isAdmin) {
      employeeId = await this.employeeRepository.getEmployeeByUserId(user.id);
    }
    return [employeeId?.id] ?? getAllUserIdNull;
  }

  async getEmployeeByCurrentUser(
    isValidated?: boolean
  ): Promise<Employee | null> {
    const userId: number = getCurrentUserFromContext();
    return await this.employeeRepository.getEmployeeByUserId(
      userId,
      isValidated
    );
  }

  /**
   * This function is used to map employee mpaths
   * and it will return ids of department, originalTeam, positionLevel, and array of teamMpath of given employee.
   * @param employee
   */
  mappingEmployeeMpath(employee: Employee) {
    const employeeMpaths = [];
    const positionLevelIds: number[] = [];
    const originalTeamIds: number[] = [];
    const employeeDepartmentIds: number[] = [];
    const teamMpath: string[] = [];
    if (employee) {
      employee.positions.forEach((position: EmployeePosition) => {
        const structure: string[] = position.mpath.split('.');
        if (structure[structure.length - 1].includes('L')) {
          structure.splice(structure.length - 1, 1);
          teamMpath.push(structure.join('.') + '%');
        } else {
          structure.splice(structure.length - 2, 2);
          teamMpath.push(structure.join('.') + '%');
        }
        employeeMpaths.push(position.mpath);
        originalTeamIds.push(position.companyStructureTeam.id);
        positionLevelIds.push(
          position.companyStructurePosition.positionLevelId.id
        );
        employeeDepartmentIds.push(position.companyStructureDepartment.id);
      });
    }

    return {
      employeeDepartmentIds,
      originalTeamIds,
      positionLevelIds,
      teamMpath
    };
  }

  /**
   * Function will throw error message whenever employee who updates pending record
   * is not the creator.
   * @param employeeId
   */
  async checkCurrentUserIsCreatorOrNot(creatorId: number) {
    const isAdmin = await this.checkIsAdmin();
    if (!isAdmin) {
      const currentEmployee: Employee = await this.getEmployeeByCurrentUser();

      if (creatorId !== currentEmployee.userId) {
        throw new ResourceForbiddenException(
          'You are not allowed to update the record.'
        );
      }
    }
  }

  /**
   * This function is used to generate raw script to check team mpath.
   * @param teamMpath
   */
  generateScriptToCheckTeamMpath(teamMpath: string[]) {
    return Raw((mpath) => {
      let stringMpath = '';
      teamMpath.forEach((data: any) => {
        stringMpath = stringMpath + "'" + data + "',";
      });
      return `${mpath} LIKE ANY (ARRAY[${stringMpath.substring(
        0,
        stringMpath.length - 1
      )}])`;
    });
  }

  async getCurrentUser() {
    const userId: number = getCurrentUserFromContext();
    return await this.grpcService.getUserById(userId);
  }

  /**
   * This function is used to validate reason template.
   * When user chooses type OTHER and does not provide reason, we will throw error.
   * @param id
   * @param reason
   */
  async validateTypeOtherInReasonTemplate(
    id: number,
    reason: string
  ): Promise<void> {
    if (id) {
      const reasonTemplate = await this.getReasonTemplateById(id);
      // check case template OTHER, but not provide reason.
      if (reasonTemplate.type === ReasonTemplateTypeEnum.OTHER && !reason) {
        throw new ResourceBadRequestException(
          'Reason template',
          'You have to provide reason when choosing type OTHER.'
        );
      }

      // check case provide reason, but not type OTHER
      if (reasonTemplate.type !== ReasonTemplateTypeEnum.OTHER && reason) {
        throw new ResourceBadRequestException(
          'Reason template',
          'Reason is required only with type OTHER.'
        );
      }
    }
  }

  // ======================= [Private block functions] =======================

  /**
   * Function is used to get reason template by id and throw error when it is not found.
   * @param id
   * @returns Promise ReasonTemplate
   */
  private async getReasonTemplateById(id: number): Promise<ReasonTemplate> {
    const reasonTemplate: ReasonTemplate | null = await this.dataSource
      .getRepository(ReasonTemplate)
      .findOneBy({ id });

    if (!reasonTemplate) {
      throw new ResourceNotFoundException('reason template', id);
    }

    return reasonTemplate;
  }

  private async getEmployeesInWorkflow(
    companyStructureDepartment: CompanyStructure,
    positionLevel: PositionLevel,
    teamIds: number[],
    requestApprovalWorkflowLevel: RequestApprovalWorkflowLevel
  ): Promise<Employee[]> {
    const employees = await this.findEmployeesBaseOnDepartmentAndPositionLevel(
      companyStructureDepartment,
      positionLevel,
      teamIds
    );

    return this.getEmployeeMatchedWithWorkflow(
      employees,
      requestApprovalWorkflowLevel
    );
  }

  private getEmployeeNestedTeamId(
    employee: Employee,
    teamIds: number[]
  ): number[] {
    if (employee.positions.length) {
      for (const position of employee.positions) {
        const structure: string = position.mpath.replace(/.L[\d.]+$/, ''); //Remove level number from mpath
        const temp: string[] = structure.split('.');
        temp.splice(0, 4);
        teamIds.push(Number(...temp));
      }
    }
    return teamIds;
  }

  private getEmployeeOutlets(employee: Employee): number[] {
    return employee.positions.map((employeePosition: EmployeePosition) => {
      return employeePosition.companyStructureOutlet.id;
    });
  }

  private async getEmployeeInsideOutletByOutletIds(
    companyStructureOutletIds: number[]
  ): Promise<string[]> {
    const employees = await this.employeeRepository.find({
      where: {
        status: In(Object.values(EmployeeActiveStatusEnum)),
        positions: {
          companyStructureOutlet: {
            id: In(companyStructureOutletIds)
          }
        }
      },
      relations: {
        positions: { companyStructureOutlet: true }
      },
      select: {
        id: true,
        userId: true,
        positions: {
          id: true,
          companyStructureOutlet: { id: true }
        }
      }
    });

    const keys: string[] = [];
    employees.forEach((employee: Employee) => {
      if (employee.userId) {
        keys.push(`${USER_MPATH_PREFIX + String(employee.userId)}`);
      }
    });

    return keys;
  }
}
