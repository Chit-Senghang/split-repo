import { Inject, Injectable } from '@nestjs/common';
import { DataSource, FindOperator, ILike, In, Raw } from 'typeorm';
import { Dayjs } from 'dayjs';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import { ResourceNotFoundException } from '../../shared-resources/exception/resource-not-found.exception';
import {
  checkIsValidYearFormat,
  customValidationDateHourMinute
} from '../../shared-resources/utils/validate-date-format';
import { EntityParam } from '../../shared-resources/ts/interface/entity-params';
import {
  customRelationPositionAndTeam,
  customSelectPositionAndTeam
} from '../../../../auth/src/common/select-relation/custom-section-relation';
import { MediaService } from '../../media/media.service';
import { RequestWorkFlowTypeEnum } from '../../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { UtilityService } from '../../utility/utility.service';
import { CreateApprovalStatusTrackingDto } from '../../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { ValidationLeaveService } from '../common/validators/validation-leave.service';
import { ApprovalStatusEnum } from '../../approval-status-tracking/common/ts/enum/approval-status.enum';
import { MediaEntityTypeEnum } from '../../media/common/ts/enums/entity-type.enum';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { AttendanceReportService } from '../../attendance/attendance-report/attendance-report.service';
import { EmployeeActiveStatusEnum } from '../../employee/enum/employee-status.enum';
import { validateByStatusActive } from './../../shared-resources/utils/validate-by-status.utils';
import { handleResourceConflictException } from './../../shared-resources/common/utils/handle-resource-conflict-exception';
import { missionRequestConstraint } from './../../shared-resources/ts/constants/resource-exception-constraints';
import { CreateMissionRequestDto } from './dto/create-mission-request.dto';
import {
  MissionRequest,
  missionRequestSearchableColumns
} from './entities/mission-request.entity';
import { PaginationQueryMissionRequestDto } from './dto/pagination-query-mission-request.dto';
import {
  MissionRequestDurationTypeEnEnum,
  MissionRequestDurationTypeKhEnum
} from './enum/mission-request-duration-type.enum';
import { MissionRequestValidationService } from './mission-request-validation.service';
import { MissionRequestRepository } from './repository/mission-request.repository';
import { IMissionRequestRepository } from './repository/interface/mission-request.repository.interface';

@Injectable()
export class MissionRequestService {
  private readonly MISSION_REQUEST = 'mission request';

  constructor(
    @Inject(MissionRequestRepository)
    private readonly missionRequestRepo: IMissionRequestRepository,
    private readonly dataSource: DataSource,
    private readonly mediaService: MediaService,
    private readonly utilityService: UtilityService,
    private readonly approvalStatusTrackingValidationService: ApprovalStatusTrackingValidationService,
    private readonly missionRequestValidationService: MissionRequestValidationService,
    private readonly validationLeaveService: ValidationLeaveService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly attendanceReportService: AttendanceReportService
  ) {}

  async create(
    createMissionRequestDto: CreateMissionRequestDto
  ): Promise<MissionRequest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.employeeRepo.getEmployeeById(
        createMissionRequestDto.employeeId
      );
      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        createMissionRequestDto.reasonTemplateId,
        createMissionRequestDto.reason
      );

      this.checkMissionRequestByTime(createMissionRequestDto);

      await this.missionRequestValidationService.checkWorkingSchedule(
        createMissionRequestDto,
        employee
      );

      const isAdmin = await this.utilityService.checkIsAdmin();
      let result: any;
      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.MISSION_REQUEST
        );
      }

      await this.validationLeaveService.validationExistingModifyLeave(
        RequestWorkFlowTypeEnum.MISSION_REQUEST,
        createMissionRequestDto.employeeId,
        {
          durationType: createMissionRequestDto.durationType,
          fromDate: createMissionRequestDto.fromDate,
          toDate: createMissionRequestDto.toDate
        }
      );

      const missionRequest = this.missionRequestRepo.create({
        reasonTemplate: { id: createMissionRequestDto.reasonTemplateId },
        employee: { id: employee.id },
        durationType: createMissionRequestDto.durationType,
        fromDate: createMissionRequestDto.fromDate,
        toDate: createMissionRequestDto.toDate,
        status: isAdmin ? StatusEnum.ACTIVE : StatusEnum.PENDING,
        ...createMissionRequestDto
      });

      const newMissionRequest = await queryRunner.manager.save(missionRequest);

      if (newMissionRequest && createMissionRequestDto?.documentIds?.length) {
        const documentIds = createMissionRequestDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          newMissionRequest.id,
          MediaEntityTypeEnum.MISSION_REQUEST,
          queryRunner
        );
      }

      if (!isAdmin) {
        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: newMissionRequest.id,
          requestToUpdateBy: null,
          requestToUpdateChange: null,
          requestToUpdateJson: null,
          firstApprovalUserId: null,
          secondApprovalUserId: null,
          status: ApprovalStatusEnum.PENDING
        };
        this.utilityService.createApprovalStatus(
          approvalStatusDto,
          result.requesterPosition,
          employee.id
        );
      }
      await queryRunner.commitTransaction();
      // wait until mission is committed to db
      if (isAdmin) {
        await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
          employee.id,
          createMissionRequestDto.fromDate,
          createMissionRequestDto.toDate
        );
      }
      return newMissionRequest;
    } catch (exception) {
      await queryRunner.rollbackTransaction();

      const documentIds: number[] = createMissionRequestDto?.documentIds;
      if (documentIds?.length) {
        this.mediaService.deleteMultipleFiles(documentIds);
      }

      handleResourceConflictException(
        exception,
        missionRequestConstraint,
        createMissionRequestDto
      );
    } finally {
      await queryRunner.release();
    }
  }

  async exportFile(
    pagination: PaginationQueryMissionRequestDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.MISSION_REQUEST,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationQueryMissionRequestDto) {
    if (pagination.fromDate) {
      checkIsValidYearFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.toDate) {
      checkIsValidYearFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
    }

    let createdAtCondition: FindOperator<Date> | undefined;
    if (pagination.createdFromDate && pagination.createdToDate) {
      createdAtCondition = Raw(
        (createdAt) =>
          `(TO_CHAR(${createdAt}, '${DEFAULT_DATE_FORMAT}') BETWEEN '${pagination.createdFromDate}' AND '${pagination.createdToDate}')`
      );
    }

    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    const createdByCondition =
      await this.utilityService.handleSearchByEmployeeCreatedBy(
        pagination.createdByUserId,
        pagination.createdByEmployeeId
      );

    const data = await this.missionRequestRepo.findAllWithPagination(
      pagination,
      missionRequestSearchableColumns,
      {
        where: {
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          employee: {
            id: In(employeeIds),
            status: In(Object.values(EmployeeActiveStatusEnum)),
            positions: {
              isMoved: false,
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
            }
          },
          fromDate: pagination.fromDate
            ? Raw(
                (alias) =>
                  `TO_CHAR(${alias}, '${DEFAULT_DATE_FORMAT}') = '${pagination.fromDate}'`
              )
            : null,
          toDate: pagination.toDate
            ? Raw(
                (alias) =>
                  `TO_CHAR(${alias}, '${DEFAULT_DATE_FORMAT}') = '${pagination.toDate}'`
              )
            : null,
          durationType: pagination.durationType ?? null,
          status: pagination.status ?? StatusEnum.ACTIVE,
          reason: pagination.reason ? ILike(`%${pagination.reason}%`) : null,
          reasonTemplate: { id: pagination.reasonTemplateId }
        },
        relation: {
          employee: customRelationPositionAndTeam,
          reasonTemplate: true
        },
        select: {
          employee: customSelectPositionAndTeam,
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        },
        mapFunction: async (missionRequest: MissionRequest) => {
          if (missionRequest.employee) {
            const employee = missionRequest.employee;
            return {
              ...missionRequest,
              durationTypeKh: this.mappingDurationTypeEnEnumToKh(
                missionRequest.durationType
              ),
              createdBy:
                await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
                  missionRequest.createdBy
                ),
              employee: {
                id: employee?.id,
                displayFullNameEn: employee?.displayFullNameEn,
                gender: employee?.gender.value,
                startDate: employee?.startDate,
                accountNo: employee?.accountNo,
                dob: employee?.dob,
                email: employee?.email,
                mpath: employee?.positions[0].mpath,
                maritalStatus: employee?.maritalStatus.value,
                isDefaultPosition:
                  employee?.positions?.at(0)?.isDefaultPosition,
                location:
                  employee?.positions[0].companyStructureLocation
                    .companyStructureComponent.name,
                outlet:
                  employee?.positions[0].companyStructureOutlet
                    .companyStructureComponent.name,
                department:
                  employee?.positions[0].companyStructureDepartment
                    .companyStructureComponent.name,
                team: employee?.positions[0].companyStructureTeam
                  .companyStructureComponent.name,
                position:
                  employee?.positions[0].companyStructurePosition
                    .companyStructureComponent.name
              }
            };
          }
        }
      }
    );

    data.data = await this.mappingMediaToResponse(data.data); // add media to response
    return data;
  }

  async findOne(id: number) {
    const missionRequest = await this.validateMissionRequest(id);

    const medias = await this.mediaService.checkMedia(missionRequest.id, false);
    return {
      ...missionRequest,
      durationTypeKh: this.mappingDurationTypeEnEnumToKh(
        missionRequest.durationType
      ),
      employee: {
        id: missionRequest.employee.id,
        displayName: missionRequest.employee.displayFullNameEn
      },
      attachmentFile: medias
    };
  }

  async update(id: number, updateMissionRequestDto: CreateMissionRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const missionRequest = await this.validateMissionRequest(id);
      validateByStatusActive(missionRequest.status);
      const employee =
        updateMissionRequestDto.employeeId &&
        (await this.employeeRepo.getEmployeeById(
          updateMissionRequestDto.employeeId
        ));
      const checkDate = this.checkMissionRequestByTime(updateMissionRequestDto);
      await this.missionRequestValidationService.checkWorkingSchedule(
        updateMissionRequestDto,
        employee
      );

      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        missionRequest.createdBy
      );

      await this.validationLeaveService.validationExistingModifyLeave(
        RequestWorkFlowTypeEnum.MISSION_REQUEST,
        updateMissionRequestDto.employeeId,
        {
          durationType: updateMissionRequestDto.durationType,
          fromDate: updateMissionRequestDto.fromDate,
          toDate: updateMissionRequestDto.toDate
        }
      );
      const updatedMissionRequest = await this.missionRequestRepo.save(
        Object.assign(missionRequest, {
          reasonTemplate: { id: updateMissionRequestDto.reasonTemplateId },
          employee: { id: missionRequest.employee.id },
          durationType: updateMissionRequestDto.durationType,
          fromDate: checkDate.fromDate,
          toDate: checkDate.toDate,
          status: StatusEnum.PENDING
        })
      );

      //Update or delete media by given documentIds
      if (updatedMissionRequest && updateMissionRequestDto?.documentIds) {
        const documentIds = updateMissionRequestDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          updatedMissionRequest.id,
          MediaEntityTypeEnum.MISSION_REQUEST,
          queryRunner
        );
      }
      //End
      await queryRunner.commitTransaction();
      return updatedMissionRequest;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        missionRequestConstraint,
        updateMissionRequestDto
      );
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number) {
    await this.approvalStatusTrackingValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.MISSION_REQUEST
    );
  }

  checkMissionRequestByTime(createMissionRequestDto: CreateMissionRequestDto) {
    const fromDate: Dayjs = customValidationDateHourMinute(
      createMissionRequestDto.fromDate
    );
    const toDate: Dayjs = customValidationDateHourMinute(
      createMissionRequestDto.toDate
    );
    switch (createMissionRequestDto.durationType) {
      case MissionRequestDurationTypeEnEnum.DATE_RANGE:
        if (fromDate.isAfter(toDate)) {
          throw new ResourceBadRequestException(
            this.MISSION_REQUEST,
            'The start date must be smaller than the end date'
          );
        }
        break;
      case MissionRequestDurationTypeEnEnum.TIME:
        if (!fromDate.isSame(toDate, 'date')) {
          throw new ResourceBadRequestException(
            this.MISSION_REQUEST,
            'The start date must be the same as the end date'
          );
        } else if (fromDate.isAfter(toDate)) {
          throw new ResourceBadRequestException(
            this.MISSION_REQUEST,
            'The start time must be smaller than the end time'
          );
        }
        break;
      case MissionRequestDurationTypeEnEnum.FIRST_HALF_DAY:
      case MissionRequestDurationTypeEnEnum.SECOND_HALF_DAY:
        break;
      default:
        throw new ResourceBadRequestException(
          this.MISSION_REQUEST,
          'Invalid duration type'
        );
    }
    return {
      fromDate,
      toDate
    };
  }

  async updateMissionRequestStatus(id: number, status: ApprovalStatusEnum) {
    const missionRequest = await this.validateMissionRequest(id);
    await this.missionRequestRepo.save(
      Object.assign(missionRequest, { status: status })
    );

    if (status === ApprovalStatusEnum.ACTIVE) {
      await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
        missionRequest.employee.id,
        missionRequest.fromDate,
        missionRequest.toDate
      );
    }

    return { employeeId: missionRequest.employee.id };
  }

  async findOneByEntityId(requestDto: EntityParam) {
    const missionRequest = await this.missionRequestRepo.findOne({
      where: {
        id: requestDto.id,
        employee: {
          id: requestDto.employeeId || null,
          displayFullNameEn: requestDto.employeeName
            ? ILike(`%${requestDto.employeeName}%`)
            : null,
          positions: {
            isMoved: false,
            isDefaultPosition: true,
            companyStructurePosition: {
              id: requestDto.positionId ? requestDto.positionId : null
            },
            companyStructureOutlet: {
              id: requestDto.outletId ? requestDto.outletId : null
            }
          }
        }
      },
      relations: {
        employee: {
          positions: {
            companyStructureCompany: { companyStructureComponent: true },
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true }
          },
          contacts: true
        }
      },
      select: {
        employee: {
          id: true,
          firstNameEn: true,
          lastNameEn: true,
          displayFullNameEn: true,
          startDate: true,
          email: true,
          accountNo: true,
          positions: {
            id: true,
            isDefaultPosition: true,
            companyStructureCompany: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructureLocation: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructureOutlet: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructureDepartment: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructurePosition: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            }
          },
          contacts: { id: true, contact: true }
        }
      }
    });
    if (!missionRequest) {
      return null;
    }
    return {
      id: missionRequest.id,
      firstNameEn: missionRequest.employee.firstNameEn,
      lastNameEn: missionRequest.employee.lastNameEn,
      phone: missionRequest.employee.contacts[0].contact,
      email: missionRequest.employee.email,
      accountNo: missionRequest.employee.accountNo,
      location:
        missionRequest.employee.positions[0].companyStructureLocation
          .companyStructureComponent.name,
      outlet:
        missionRequest.employee.positions[0].companyStructureOutlet
          .companyStructureComponent.name,
      department:
        missionRequest.employee.positions[0].companyStructureDepartment
          .companyStructureComponent.name,
      position:
        missionRequest.employee.positions[0].companyStructurePosition
          .companyStructureComponent.name,
      displayFullNameEn: missionRequest.employee.displayFullNameEn,
      employeeId: missionRequest.employee ? missionRequest.employee.id : null
    };
  }

  getMissionRequestDurationTypeEnum(): {
    durationTypeEn: MissionRequestDurationTypeEnEnum[];
    durationTypeKh: MissionRequestDurationTypeKhEnum[];
  } {
    return {
      durationTypeEn: Object.values(MissionRequestDurationTypeEnEnum),
      durationTypeKh: Object.values(MissionRequestDurationTypeKhEnum)
    };
  }

  // =========================== [Private block function] ===========================

  private mappingDurationTypeEnEnumToKh(
    durationTypeEn: MissionRequestDurationTypeEnEnum
  ): MissionRequestDurationTypeKhEnum {
    switch (durationTypeEn) {
      case MissionRequestDurationTypeEnEnum.DATE_RANGE:
        return MissionRequestDurationTypeKhEnum.DATE_RANGE;
      case MissionRequestDurationTypeEnEnum.FIRST_HALF_DAY:
        return MissionRequestDurationTypeKhEnum.FIRST_HALF_DAY;
      case MissionRequestDurationTypeEnEnum.SECOND_HALF_DAY:
        return MissionRequestDurationTypeKhEnum.SECOND_HALF_DAY;
      case MissionRequestDurationTypeEnEnum.TIME:
        return MissionRequestDurationTypeKhEnum.TIME;
      default:
        break;
    }
  }

  private async validateMissionRequest(id: number): Promise<MissionRequest> {
    const missionRequest: MissionRequest =
      await this.missionRequestRepo.findOne({
        where: {
          id,
          employee: {
            positions: {
              isMoved: false
            }
          }
        },
        relations: {
          employee: {
            positions: {
              companyStructurePosition: {
                positionLevelId: true
              }
            }
          },
          reasonTemplate: true
        },
        select: {
          employee: {
            id: true,
            displayFullNameEn: true,
            positions: {
              id: true,
              companyStructurePosition: {
                id: true,
                positionLevelId: {
                  id: true,
                  levelNumber: true,
                  levelTitle: true
                }
              }
            }
          },
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        }
      });

    if (!missionRequest) {
      throw new ResourceNotFoundException(this.MISSION_REQUEST, id);
    }

    return missionRequest;
  }

  private async mappingMediaToResponse(
    missionRequests: MissionRequest[]
  ): Promise<MissionRequest[]> {
    if (missionRequests.length) {
      for (const missionRequest of missionRequests) {
        const medias = await this.mediaService.checkMedia(
          missionRequest.id,
          false
        );
        missionRequest['attachmentFile'] = medias;
      }

      return missionRequests;
    }

    return [];
  }
}
