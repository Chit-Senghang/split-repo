import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsSelect,
  Repository,
  ILike,
  In,
  QueryRunner,
  LessThanOrEqual,
  FindOperator,
  Raw,
  Not
} from 'typeorm';
import { GrpcService } from '../../../employee/src/grpc/grpc.service';
import { AllEmployeeConst } from '../constant/all-employee-const';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { Employee } from '../employee/entity/employee.entity';
import {
  checkIsValidYearFormat,
  validateDateTime
} from '../shared-resources/utils/validate-date-format';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import {
  customRelationPositionAndTeam,
  customSelectPositionAndTeam,
  relationParentAndChildCompanyStructure
} from '../../../auth/src/common/select-relation/custom-section-relation';
import { UtilityService } from '../utility/utility.service';
import { MediaService } from '../media/media.service';
import { CreateApprovalStatusTrackingDto } from '../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { ApprovalStatusEnum } from '../approval-status-tracking/common/ts/enum/approval-status.enum';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { EmployeeService } from '../employee/employee.service';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../shared-resources/common/utils/date-utils';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { EmployeeResignationStatusEnum } from '../employee-resignation/common/ts/enums/employee-resignation-status.enum';
import {
  EmployeeActiveStatusEnum,
  EmployeeStatusEnum
} from '../employee/enum/employee-status.enum';
import { WorkingShiftRepository } from '../workshift-type/repository/working-shift.repository';
import { IWorkingShiftRepository } from '../workshift-type/repository/interface/working-shift.repository.interface';
import { employeeMovementConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { CreateEmployeeMovementDto } from './dto/create-employee-movement.dto';
import { UpdateEmployeeMovementDto } from './dto/update-employee-movement.dto';
import { EmployeeMovementValidationService } from './employee-movement-validation.service';
import {
  EmployeeMovement,
  employeeMovementSearchableColumns
} from './entities/employee-movement.entity';
import { PaginationQueryEmployeeMovementDto } from './dto/pagination-query-employee-movement.dto';
import { EmployeeMovementStatusEnum } from './ts/enums/movement-status.enum';
import { EmployeeMovementRepository } from './repository/employee-movement.repository';
import { IEmployeeMovementRepository } from './repository/interface/employee-movement.repository.interface';

@Injectable()
export class EmployeeMovementService {
  private readonly EMPLOYEE_MOVEMENT = 'employee movement';

  private readonly EMPLOYEE = 'employee';

  constructor(
    private readonly employeeMovementValidateService: EmployeeMovementValidationService,
    @InjectRepository(EmployeePosition)
    private readonly employeePositionRepo: Repository<EmployeePosition>,
    private readonly dataSource: DataSource,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService,
    private readonly grpcService: GrpcService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly employeeService: EmployeeService,
    @Inject(EmployeeMovementRepository)
    private readonly employeeMovementRepository: IEmployeeMovementRepository,
    @Inject(WorkingShiftRepository)
    private readonly workingShiftRepository: IWorkingShiftRepository
  ) {}

  async create(
    employeePositionId: number,
    createEmployeeMovementDto: CreateEmployeeMovementDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    let employeeMovementExist: EmployeeMovement;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      //validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        createEmployeeMovementDto.reasonTemplateId,
        createEmployeeMovementDto.reason
      );

      const isAdmin = await this.utilityService.checkIsAdmin();
      const employee: Employee = await this.employeeRepo.getEmployeeById(
        createEmployeeMovementDto.employeeId
      );

      //validate move position
      const isMovePosition: boolean = await this.validateIsMovePosition(
        createEmployeeMovementDto.requestMovementEmployeePositionId,
        createEmployeeMovementDto.previousCompanyStructurePositionId,
        createEmployeeMovementDto.newCompanyStructurePositionId
      );

      //check if move position
      if (isMovePosition) {
        //validate if current position is exist.
        await this.employeeMovementValidateService.getCurrentPositionById(
          createEmployeeMovementDto.requestMovementEmployeePositionId
        );

        //get previous company structure
        await this.employeeMovementValidateService.getCompanyStructurePositionById(
          createEmployeeMovementDto.previousCompanyStructurePositionId
        );

        //get target position
        const positionInCompanyStructure =
          await this.employeeMovementValidateService.getCompanyStructureByType(
            createEmployeeMovementDto.newCompanyStructurePositionId,
            CompanyStructureTypeEnum.POSITION
          );

        //check if move to existing positions
        employee.positions.forEach((position) => {
          if (
            position.companyStructurePosition.id ===
            positionInCompanyStructure.id
          ) {
            throw new ResourceForbiddenException(
              AllEmployeeConst.EMPLOYEE_DUPLICATE_POSITION
            );
          }
        });
      }

      //check if move to existing employment type
      if (
        createEmployeeMovementDto.newEmploymentType === employee.employmentType
      ) {
        throw new ResourceForbiddenException(
          AllEmployeeConst.DUPLICATE_EMPLOYMENT_TYPE
        );
      }

      //check if move working shift
      await this.workingShiftRepository.findWorkingShiftById(
        createEmployeeMovementDto.newWorkingShiftId
      );
      if (
        createEmployeeMovementDto.newWorkingShiftId ===
        employee.workingShiftId.id
      ) {
        throw new ResourceForbiddenException(
          AllEmployeeConst.DUPLICATE_WORKSHIFT
        );
      }

      const employeeLastMovement: EmployeeMovement | null =
        await this.employeeMovementRepository.getEmployeeLastMovement(
          employee.id
        );

      //validate with workflow
      let result: any;
      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.MOVEMENT
        );
      }
      if (
        isMovePosition ||
        createEmployeeMovementDto?.newEmploymentType?.length ||
        createEmployeeMovementDto.newWorkingShiftId
      ) {
        const employeeMovement = queryRunner.manager.create(EmployeeMovement, {
          employee: {
            id: createEmployeeMovementDto.employeeId
          },
          requestMovementEmployeePosition: {
            id: createEmployeeMovementDto.requestMovementEmployeePositionId
          },
          previousCompanyStructurePosition: {
            id: createEmployeeMovementDto.previousCompanyStructurePositionId
          },
          newCompanyStructurePosition: {
            id: createEmployeeMovementDto.newCompanyStructurePositionId
          },
          effectiveDate: createEmployeeMovementDto.effectiveDate
            ? validateDateTime(createEmployeeMovementDto.effectiveDate)
            : null,
          lastMovementDate: employeeLastMovement?.lastMovementDate ?? null,
          status: EmployeeMovementStatusEnum.PENDING,
          previousEmploymentType: createEmployeeMovementDto?.newEmploymentType
            ? employee.employmentType
            : '',
          newEmploymentType: createEmployeeMovementDto?.newEmploymentType ?? '',
          previousWorkingShiftId: {
            id: createEmployeeMovementDto?.newWorkingShiftId
              ? employee.workingShiftId.id
              : null
          },
          newWorkingShiftId: {
            id: createEmployeeMovementDto?.newWorkingShiftId ?? null
          },
          reason: createEmployeeMovementDto.reason,
          reasonTemplate: { id: createEmployeeMovementDto.reasonTemplateId }
        });
        employeeMovementExist =
          await queryRunner.manager.save(employeeMovement);

        if (
          employeeMovementExist &&
          createEmployeeMovementDto?.documentIds?.length
        ) {
          const documentIds = createEmployeeMovementDto.documentIds;
          await this.utilityService.updateMediaEntityIdAndType(
            documentIds,
            employeeMovementExist.id,
            MediaEntityTypeEnum.MOVEMENT,
            queryRunner
          );
        }

        if (!isAdmin) {
          const approvalStatusDto: CreateApprovalStatusTrackingDto = {
            approvalWorkflowId: result.requestApprovalWorkflowId,
            requestWorkflowTypeId: result.workflowTypeId,
            entityId: employeeMovementExist.id,
            requestToUpdateBy: null,
            requestToUpdateChange: null,
            requestToUpdateJson: null,
            firstApprovalUserId: null,
            secondApprovalUserId: null,
            status: ApprovalStatusEnum.PENDING
          };
          await this.utilityService.createApprovalStatus(
            approvalStatusDto,
            result.requesterPosition,
            employee.id
          );
        }

        if (isAdmin) {
          // modify and create new employee position when admin create record.
          await this.updateEmployeeMovementStatus(
            employeeMovementExist.id,
            queryRunner,
            EmployeeMovementStatusEnum.ACTIVE,
            isMovePosition
          );
        }
        await queryRunner.commitTransaction();

        return employeeMovementExist;
      } else {
        throw new ResourceBadRequestException(
          'employeeMovement',
          'employeeMovement must at least have one purpose.'
        );
      }
    } catch (exception) {
      const documentIds: number[] = createEmployeeMovementDto?.documentIds;
      if (documentIds?.length) {
        this.mediaService.deleteMultipleFiles(documentIds);
      }

      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        employeeMovementConstraint,
        createEmployeeMovementDto
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getPreviousEmployeeByUserLogin() {
    const currentUserId: number = getCurrentUserFromContext();

    return await this.employeeMovementValidateService.validateGetRequestPreviousEmployeePositionByCurrentUserLogin(
      currentUserId
    );
  }

  async getCurrentEmployeeLogin(userId: number) {
    const userIdAdmin = null;
    const isAdmin = await this.utilityService.checkIsAdmin();
    const userIdExist = isAdmin === true ? userIdAdmin : userId;
    const employee = await this.employeeRepo.findOne({
      where: {
        userId: userIdExist,
        positions: {
          isMoved: false
        }
      },
      select: {
        id: true,
        displayFullNameEn: true
      }
    });

    if (!employee) {
      throw new ResourceNotFoundException(this.EMPLOYEE, userId);
    }

    return employee;
  }

  async update(
    id: number,
    updateEmployeeMovementDto: UpdateEmployeeMovementDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employeeMovement =
        await this.employeeMovementValidateService.findOneById(id);
      this.employeeMovementValidateService.checkStatusActive(
        employeeMovement.status
      );

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        updateEmployeeMovementDto.reasonTemplateId ??
          employeeMovement.reasonTemplate.id,
        updateEmployeeMovementDto.reason
      );

      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        employeeMovement.createdBy
      );

      //* find employee id for movement
      const employee = await this.employeeRepo.getEmployeeById(
        updateEmployeeMovementDto.employeeId
      );
      const isAdmin = await this.utilityService.checkIsAdmin();
      if (!isAdmin) {
        await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.MOVEMENT
        );
      }

      // check if move position
      const isMovePosition =
        await this.employeeMovementValidateService.validateUpdateMovingPosition(
          employeeMovement,
          updateEmployeeMovementDto
        );
      if (isMovePosition) {
        await this.employeeMovementValidateService.getCompanyStructurePositionById(
          updateEmployeeMovementDto.previousCompanyStructurePositionId
        );
        await this.employeeMovementValidateService.getEmployeePositionById(
          updateEmployeeMovementDto.requestMovementEmployeePositionId
        );
        await this.employeeMovementValidateService.getCompanyStructurePositionById(
          updateEmployeeMovementDto.newCompanyStructurePositionId
        );
      }

      // get employee last movement date
      const employeeLastMovement: EmployeeMovement | null =
        await this.employeeMovementRepository.getEmployeeLastMovement(
          employee.id
        );

      //validate employment type
      if (
        updateEmployeeMovementDto?.newEmploymentType &&
        !employeeMovement.newEmploymentType
      ) {
        throw new ResourceForbiddenException(
          'moveEmploymentType',
          'You can not update data that you did not create.'
        );
      }

      // validate working shift
      if (
        updateEmployeeMovementDto?.newWorkingShiftId &&
        !employeeMovement.newWorkingShiftId?.id
      ) {
        throw new ResourceForbiddenException(
          'moveWorkingShift',
          'You can not update data that you did not create.'
        );
      } else if (
        updateEmployeeMovementDto?.newWorkingShiftId &&
        employeeMovement.newWorkingShiftId.id
      ) {
        await this.workingShiftRepository.findWorkingShiftById(
          updateEmployeeMovementDto.newWorkingShiftId
        );
      }

      const employeeMovementUpdate = queryRunner.manager.create(
        EmployeeMovement,
        Object.assign(employeeMovement, {
          employee: employee.id,
          reasonTemplate: { id: updateEmployeeMovementDto.reasonTemplateId },
          previousEmploymentType: 0,
          requestMovementEmployeePosition: {
            id: updateEmployeeMovementDto.requestMovementEmployeePositionId
          },
          previousCompanyStructurePosition: {
            id: updateEmployeeMovementDto.previousCompanyStructurePositionId
          },
          newCompanyStructurePosition: {
            id: updateEmployeeMovementDto.newCompanyStructurePositionId
          },
          effectiveDate: updateEmployeeMovementDto.effectiveDate
            ? validateDateTime(updateEmployeeMovementDto.effectiveDate)
            : employeeMovement.effectiveDate,
          lastMovementDate: employeeLastMovement?.lastMovementDate ?? null,
          reason: updateEmployeeMovementDto.reason,
          status: ApprovalStatusEnum.PENDING,
          newEmploymentType: updateEmployeeMovementDto?.newEmploymentType,
          newWorkingShiftId: updateEmployeeMovementDto?.newWorkingShiftId
        })
      );
      const updatedEmployeeMovement = await queryRunner.manager.save(
        employeeMovementUpdate
      );

      //Update or delete media by given documentIds
      if (updatedEmployeeMovement && updateEmployeeMovementDto?.documentIds) {
        const documentIds = updateEmployeeMovementDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          updatedEmployeeMovement.id,
          MediaEntityTypeEnum.MOVEMENT,
          queryRunner
        );
      }
      //End

      await queryRunner.commitTransaction();
      return updatedEmployeeMovement;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        employeeMovementConstraint,
        updateEmployeeMovementDto
      );
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number) {
    const employeeMovement = await this.employeeMovementRepository.findOne({
      select: EmployeeMovementService.QUERY.select,
      where: {
        id,
        employee: {
          positions: {
            isMoved: false
          }
        }
      },
      relations: EmployeeMovementService.QUERY.relations
    });
    if (!employeeMovement) {
      throw new ResourceNotFoundException(this.EMPLOYEE_MOVEMENT, id);
    }
    return employeeMovement;
  }

  async exportFile(
    pagination: PaginationQueryEmployeeMovementDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.EMPLOYEE_MOVEMENT,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationQueryEmployeeMovementDto) {
    if (pagination.effectiveDate) {
      checkIsValidYearFormat(pagination.effectiveDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.lastMovementDate) {
      checkIsValidYearFormat(pagination.lastMovementDate, DEFAULT_DATE_FORMAT);
    }

    let createdAtCondition: FindOperator<undefined | Date>;
    if (pagination.createdFromDate && pagination.createdToDate) {
      createdAtCondition = Raw(
        (createdAt) =>
          `(TO_CHAR(${createdAt}, '${DEFAULT_DATE_FORMAT}') BETWEEN '${pagination.createdFromDate}' AND '${pagination.createdToDate}')`
      );
    }

    const createdByCondition =
      await this.utilityService.handleSearchByEmployeeCreatedBy(
        pagination.createdByUserId,
        pagination.createdByEmployeeId
      );
    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    return await this.employeeMovementRepository.findAllWithPagination(
      pagination,
      employeeMovementSearchableColumns,
      {
        select: EmployeeMovementService.QUERY.select,
        relation: EmployeeMovementService.QUERY.relations,
        where: {
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          employee: {
            id: In(employeeIds),
            status: In(Object.values(EmployeeActiveStatusEnum)),
            positions: {
              isDefaultPosition: true,
              companyStructureCompany: {
                id: pagination.companyId
              },
              companyStructureLocation: {
                id: pagination.locationId
              },
              companyStructureDepartment: {
                id: pagination.departmentId
              },
              companyStructureOutlet: {
                id: pagination.outletId
              },
              companyStructureTeam: {
                id: pagination.teamId
              },
              companyStructurePosition: {
                id: pagination.positionId
              }
            },
            displayFullNameEn: pagination.displayFullNameEn
              ? ILike(`%${pagination.displayFullNameEn}%`)
              : null,
            accountNo: pagination.accountNo
              ? ILike(`%${pagination.accountNo}%`)
              : null
          },
          effectiveDate: pagination.effectiveDate
            ? pagination.effectiveDate
            : null,
          lastMovementDate: pagination.lastMovementDate
            ? pagination.lastMovementDate
            : null,
          status:
            pagination.status ??
            In([
              EmployeeResignationStatusEnum.ACTIVE,
              EmployeeResignationStatusEnum.IN_SCHEDULE
            ]),
          reason: pagination.reason ? ILike(`%${pagination.reason}%`) : null,
          reasonTemplate: { id: pagination.reasonTemplateId }
        },
        mapFunction: async (employeeMovement: EmployeeMovement) => {
          if (employeeMovement.employee) {
            const employee = employeeMovement.employee;
            delete employeeMovement.employee;
            return {
              ...employeeMovement,
              createdBy:
                await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
                  employeeMovement.createdBy
                ),
              employee: {
                id: employee.id,
                email: employee.email,
                firstNameEn: employee.firstNameEn,
                mpath: employee.positions[0].mpath,
                accountNo: employee.accountNo,
                dob: employee.dob,
                gender: employee.gender.value,
                startDate: employee.startDate,
                maritalStatus: employee.maritalStatus.value,
                displayFullNameEn: employee.displayFullNameEn,
                location:
                  employee.positions[0].companyStructureLocation
                    .companyStructureComponent.name,
                outlet:
                  employee.positions[0].companyStructureOutlet
                    .companyStructureComponent.name,
                department:
                  employee.positions[0].companyStructureDepartment
                    .companyStructureComponent.name,
                team: employee.positions[0].companyStructureTeam
                  .companyStructureComponent.name,
                position:
                  employee.positions[0].companyStructurePosition
                    .companyStructureComponent.name
              }
            };
          }
        }
      }
    );
  }

  async delete(id: number): Promise<void> {
    await this.approvalStatusValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.MOVEMENT
    );
  }

  /**
   * Function will return employee movement that effective date is equal to
   * current date and status is IN_SCHEDULE
   */
  async getEmployeeMovementThatEffectiveDateEqualToOrLessThanCurrentDate(): Promise<
    EmployeeMovement[]
  > {
    const currentDate = getCurrentDateWithFormat() as any;

    return await this.employeeMovementRepository.find({
      where: {
        effectiveDate: LessThanOrEqual(currentDate),
        status: EmployeeMovementStatusEnum.IN_SCHEDULE
      }
    });
  }

  async handleUpdateEmployeeMovementJob(): Promise<void> {
    const employeeMovements: EmployeeMovement[] = // employee movement that effective date is equal current date
      await this.getEmployeeMovementThatEffectiveDateEqualToOrLessThanCurrentDate();

    if (employeeMovements.length) {
      for (const employeeMovement of employeeMovements) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          await this.updateEmployeeMovementStatus(
            employeeMovement.id,
            queryRunner
          );
          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          Logger.log(error);
        } finally {
          await queryRunner.release();
        }
      }
    }
  }

  /**
   * This function is used to update employee movement status to ACTIVE.
   * It will also update old position is_move to true and create new position.
   * @param employeeMovementId
   */
  async updateEmployeeMovementStatus(
    employeeMovementId: number,
    queryRunner: QueryRunner,
    employeeMovementStatus = EmployeeMovementStatusEnum.ACTIVE,
    isMovePosition: boolean = true
  ): Promise<void> {
    //get new employee movement that just created
    const employeeMovement = await this.getEmployeeMovementForUpdateStatus(
      employeeMovementId,
      queryRunner
    );
    const employee: Employee = await this.employeeRepo.findOne({
      where: {
        id: employeeMovement.employee.id
      },
      relations: {
        workingShiftId: true
      }
    });

    // get employee last movement date
    const employeeLastMovement: EmployeeMovement | null =
      await this.employeeMovementRepository.getEmployeeLastMovement(
        employeeMovement.employee.id
      );

    if (employeeMovement) {
      const isCurrentDate = this.checkEffectiveDateEqualToCurrentDate(
        employeeMovement.effectiveDate
      );

      // case effective date is the same as current date.
      if (isCurrentDate) {
        const updatedEmployeeMovement = await queryRunner.manager.save(
          Object.assign(employeeMovement, {
            status: employeeMovementStatus,
            lastMovementDate: employeeLastMovement?.effectiveDate
          })
        );
        // if move position
        if (isMovePosition) {
          const previousEmployeePosition =
            await this.getPreviousEmployeePosition(employeeMovement);

          if (
            updatedEmployeeMovement.status === EmployeeMovementStatusEnum.ACTIVE
          ) {
            await this.updateEmployeePositionAndCreateNewPositionWhenMovementActive(
              queryRunner,
              updatedEmployeeMovement,
              previousEmployeePosition
            );

            // remove and update mpath when updated movement.
            const userId = getCurrentUserFromContext();
            await this.grpcService.updateEmployeeMpath(userId);
          }
        }
        if (employeeMovement.newEmploymentType.length) {
          await queryRunner.manager.save(
            Object.assign(employee, {
              employmentType: employeeMovement.newEmploymentType
            })
          );
        }
        if (employeeMovement.newWorkingShiftId) {
          await queryRunner.manager.save(
            Object.assign(employee, {
              workingShiftId: employeeMovement.newWorkingShiftId
            })
          );
        }
      } else {
        await queryRunner.manager.save(
          Object.assign(employeeMovement, {
            status: EmployeeMovementStatusEnum.IN_SCHEDULE
          })
        );
      }
    }
  }

  private static QUERY = {
    relations: {
      employee: customRelationPositionAndTeam,
      newWorkingShiftId: true,
      previousWorkingShiftId: true,
      previousCompanyStructurePosition: {
        companyStructureComponent: true
      },
      newCompanyStructurePosition: {
        companyStructureComponent: true,
        positionLevelId: true
      },
      requestMovementEmployeePosition: relationParentAndChildCompanyStructure,
      reasonTemplate: true
    } as FindOptionsRelations<EmployeeMovement>,
    select: {
      employee: customSelectPositionAndTeam,
      requestMovementEmployeePosition: {
        id: true,
        isDefaultPosition: true,
        companyStructurePosition: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      reasonTemplate: {
        id: true,
        type: true,
        name: true
      }
    } as FindOptionsSelect<EmployeeMovement>
  };

  //======================= [Private functions block] =======================//

  /**
   * Function will return true if all params > 0, return false if all params are not truthy,
   * return false and throw exception if not all param is truthy or falsy.
   * @param requestMovementEmployeePositionId
   * @param previousCompanyStructurePositionId
   * @param newCompanyStructurePositionId
   */
  private async validateIsMovePosition(
    requestMovementEmployeePositionId: number,
    previousCompanyStructurePositionId: number,
    newCompanyStructurePositionId: number
  ): Promise<boolean> {
    if (
      !requestMovementEmployeePositionId &&
      !previousCompanyStructurePositionId &&
      !newCompanyStructurePositionId
    ) {
      return false;
    } else {
      if (!requestMovementEmployeePositionId) {
        throw new ResourceBadRequestException(
          'requestMovementEmployeePositionId',
          `requestMovementEmployeePositionId is required.`
        );
      }
      if (!previousCompanyStructurePositionId) {
        throw new ResourceBadRequestException(
          'previousCompanyStructurePositionId',
          `previousCompanyStructurePositionId is required.`
        );
      }
      if (!newCompanyStructurePositionId) {
        throw new ResourceBadRequestException(
          'newCompanyStructurePositionId',
          `newCompanyStructurePositionId is required.`
        );
      }
      return true;
    }
  }

  /**
   * Function will return true if currentDate and effectiveDate is the same; otherwise, return false.
   * @param effectiveDate
   */
  private checkEffectiveDateEqualToCurrentDate(effectiveDate: Date): boolean {
    const currentDate: string = getCurrentDateWithFormat();
    const formattedEffectiveDate: string = dayJs(effectiveDate)
      .utc(true)
      .format(DEFAULT_DATE_FORMAT);

    return dayJs(currentDate).isSame(formattedEffectiveDate);
  }

  /**
   * This function is used to update old position and create new position
   * when request movement is ACTIVE
   * @param queryRunner
   * @param employeeMovement
   * @param previousPositionEmployee
   */
  private async updateEmployeePositionAndCreateNewPositionWhenMovementActive(
    queryRunner: QueryRunner,
    employeeMovement: EmployeeMovement,
    previousPositionEmployee: EmployeePosition
  ): Promise<EmployeePosition> {
    const updateAndCreateEmployeePosition = Object.assign(
      previousPositionEmployee,
      {
        isMoved: true,
        toEmployeePositionId: previousPositionEmployee.id
      }
    );

    await queryRunner.manager.save(updateAndCreateEmployeePosition);

    const newPositionId = employeeMovement.newCompanyStructurePosition;
    const newEmployeeId = employeeMovement.employee;
    await this.employeeService.insertPositions(
      [
        {
          positionId: newPositionId.id,
          isDefaultPosition:
            employeeMovement.requestMovementEmployeePosition.isDefaultPosition
        }
      ],
      queryRunner,
      newEmployeeId.id,
      false,
      false
    );
    const newEmployeePosition = await queryRunner.manager.find(
      EmployeePosition,
      {
        order: {
          id: 'DESC'
        }
      }
    );
    return newEmployeePosition.at(-1);
  }

  /**
   * This function is used to get employee movement for updating status
   * from approval workflow.
   * @param employeeMovementId
   */
  private async getEmployeeMovementForUpdateStatus(
    employeeMovementId: number,
    queryRunner: QueryRunner
  ): Promise<EmployeeMovement> {
    return await queryRunner.manager.findOne(EmployeeMovement, {
      where: {
        id: employeeMovementId,
        employee: {
          status: Not(In([EmployeeStatusEnum.RESIGNED]))
        }
      },
      relations: {
        employee: {
          positions: true
        },
        previousCompanyStructurePosition: true,
        newCompanyStructurePosition: {
          companyStructureComponent: true
        },
        requestMovementEmployeePosition: {
          employee: true,
          companyStructurePosition: true
        },
        previousWorkingShiftId: true,
        newWorkingShiftId: true
      },
      select: {
        employee: {
          id: true,
          positions: {
            id: true
          }
        }
      }
    });
  }

  /**
   * Function will return previous position of employee
   * when request movement is ACTIVE
   * @param employeeMovement
   * @returns Employee
   */
  private async getPreviousEmployeePosition(
    employeeMovement: EmployeeMovement
  ): Promise<EmployeePosition> {
    const employeeOldPositionId: number =
      employeeMovement.requestMovementEmployeePosition.companyStructurePosition
        .id;
    const employeeId: number =
      employeeMovement.requestMovementEmployeePosition.employee.id;

    const previousPositionEmployee = await this.employeePositionRepo.findOne({
      where: {
        companyStructurePosition: {
          id: employeeOldPositionId
        },
        employee: {
          id: employeeId
        },
        isMoved: false
      },
      relations: {
        companyStructurePosition: true
      }
    });

    if (!previousPositionEmployee) {
      throw new ResourceNotFoundException('Employee old Position', employeeId);
    }

    return previousPositionEmployee;
  }
}
