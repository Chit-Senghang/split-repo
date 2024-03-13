import {
  DataSource,
  DeleteResult,
  EntityTarget,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Raw
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import { EmployeeWarning } from '../employee-warning/entities/employee-warning.entity';
import { EmployeeResignation } from '../employee-resignation/entity/employee-resignation.entity';
import { Employee } from '../employee/entity/employee.entity';
import { MissedScanRequest } from '../attendance/missed-scan-request/entities/missed-scan-request.entity';
import { OvertimeRequest } from '../attendance/overtime-request/entities/overtime-request.entity';
import { LeaveRequest } from '../leave/leave-request/entities/leave-request.entity';
import { MissionRequest } from '../leave/mission-request/entities/mission-request.entity';
import { DayOffRequest } from '../leave/day-off-request/entities/day-off-request.entity';
import { EmployeeMovement } from '../employee-movement/entities/employee-movement.entity';
import { PayrollDeduction } from '../payroll-deduction/entities/payroll-deduction.entity';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { ResourceNotFoundException } from '../shared-resources/exception/resource-not-found.exception';
import { PayrollBenefitAdjustment } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment.entity';
import { RequestWorkFlowType } from '../request-workflow-type/entities/request-workflow-type.entity';
import { Notification } from '../notification/entities/notification.entity';
import { WorkflowTypeEnum } from '../shared-resources/common/enum/workflow-type.enum';
import { UtilityService } from '../utility/utility.service';
import { TypeEnum } from '../request-approval-workflow/common/ts/enum/type.enum';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { Media } from '../media/entities/media.entity';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { MediaService } from '../media/media.service';
import { ApprovalStatus } from './entities/approval-status-tracking.entity';
import { ApprovalStatusEnum } from './common/ts/enum/approval-status.enum';
import { UpdateApprovalStatusTrackingDto } from './dto/update-approval-status-tracking.dto';

@Injectable()
export class ApprovalStatusTrackingValidationService {
  private readonly APPROVAL_STATUS: string = 'approval status';

  private readonly REJECT_ERROR_MESSAGE: string =
    'You cannot reject without reason.';

  constructor(
    private readonly dataSource: DataSource,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService
  ) {}

  async deleteEntityById(id: number, type: MediaEntityTypeEnum) {
    switch (type) {
      case MediaEntityTypeEnum.WARNING: {
        await this.getEachEntityById(
          id,
          EmployeeWarning,
          MediaEntityTypeEnum.WARNING
        );
        break;
      }
      case MediaEntityTypeEnum.RESIGNATION_REQUEST: {
        await this.getEachEntityById(
          id,
          EmployeeResignation,
          MediaEntityTypeEnum.RESIGNATION_REQUEST
        );
        break;
      }
      case MediaEntityTypeEnum.EMPLOYEE_INFO_UPDATE: {
        await this.getEachEntityById(
          id,
          Employee,
          MediaEntityTypeEnum.EMPLOYEE_INFO_UPDATE
        );
        break;
      }
      case MediaEntityTypeEnum.MISSED_SCAN: {
        await this.getEachEntityById(
          id,
          MissedScanRequest,
          MediaEntityTypeEnum.MISSED_SCAN
        );
        break;
      }
      case MediaEntityTypeEnum.OVERTIME_REQUEST: {
        await this.getEachEntityById(
          id,
          OvertimeRequest,
          MediaEntityTypeEnum.OVERTIME_REQUEST
        );
        break;
      }
      case MediaEntityTypeEnum.LEAVE_REQUEST: {
        await this.getEachEntityById(
          id,
          LeaveRequest,
          MediaEntityTypeEnum.LEAVE_REQUEST
        );
        break;
      }
      case MediaEntityTypeEnum.MISSION_REQUEST: {
        await this.getEachEntityById(
          id,
          MissionRequest,
          MediaEntityTypeEnum.MISSION_REQUEST
        );
        break;
      }
      case MediaEntityTypeEnum.DAY_OFF_REQUEST: {
        await this.getEachEntityById(
          id,
          DayOffRequest,
          MediaEntityTypeEnum.DAY_OFF_REQUEST
        );
        break;
      }
      case MediaEntityTypeEnum.PAYROLL_BENEFIT_ADJUSTMENT: {
        await this.getEachEntityById(
          id,
          PayrollBenefitAdjustment,
          MediaEntityTypeEnum.PAYROLL_BENEFIT_ADJUSTMENT
        );
        break;
      }
      case MediaEntityTypeEnum.MOVEMENT: {
        await this.getEachEntityById(
          id,
          EmployeeMovement,
          MediaEntityTypeEnum.MOVEMENT
        );
        break;
      }
      case MediaEntityTypeEnum.PAYROLL_DEDUCTION: {
        await this.getEachEntityById(
          id,
          PayrollDeduction,
          MediaEntityTypeEnum.PAYROLL_DEDUCTION
        );
        break;
      }
      default:
        break;
    }
  }

  async getEachEntityById(
    id: number,
    entity: EntityTarget<any>,
    requestType: MediaEntityTypeEnum
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const response = await this.dataSource
        .getRepository(entity)
        .findOne({ where: { id } });

      if (!response) {
        const tableName = this.dataSource
          .getMetadata(entity)
          .tableName.replace(/[_]/g, ' ');

        throw new ResourceNotFoundException(tableName, id);
      }

      if (response.status === StatusEnum.ACTIVE) {
        throw new ResourceForbiddenException(
          'Delete record',
          `You are not allowed to delete this record because of status ACTIVE.`
        );
      } else if (response.status === StatusEnum.REJECTED) {
        throw new ResourceForbiddenException(
          'Delete record',
          `You are not allowed to delete this record because of status REJECTED.`
        );
      }

      //check if current user is creator or not.
      const isAdmin = await this.utilityService.checkIsAdmin();
      const currentUserId = getCurrentUserFromContext();
      if (!isAdmin && response.createdBy !== currentUserId) {
        throw new ResourceForbiddenException(
          'Delete record',
          'You are not allowed to delete record.'
        );
      }

      const approvalStatus: ApprovalStatus | null | undefined =
        await this.getApprovalStatusByEntityIdAndRequestType(
          requestType,
          response.id
        );

      if (approvalStatus) {
        const notificationIds: number[] = approvalStatus?.notification.map(
          (notification) => notification.id
        );

        notificationIds.length &&
          (await queryRunner.manager.delete(Notification, notificationIds));
        await queryRunner.manager.delete(ApprovalStatus, approvalStatus.id);
      }

      const deleteResult: DeleteResult = await queryRunner.manager.delete(
        entity,
        response.id
      );

      //Delete attached documents if exist
      if (deleteResult) {
        const documentObjects: Media[] =
          await this.mediaService.findByEntityIdAndType(
            response.id,
            requestType
          );
        if (documentObjects.length) {
          const documentIds: number[] = documentObjects.map(({ id }) => id);
          await this.mediaService.deleteMultipleFiles(documentIds);
        }
      }
      //End

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getApprovalStatusByEntityIdAndRequestType(
    requestType: MediaEntityTypeEnum,
    entityId: number
  ): Promise<ApprovalStatus | undefined | null> {
    const workflowType: RequestWorkFlowType | null = await this.dataSource
      .getRepository(RequestWorkFlowType)
      .findOne({ where: { requestType } });

    if (workflowType) {
      return await this.dataSource.getRepository(ApprovalStatus).findOne({
        where: { entityId, requestWorkflowType: { id: workflowType.id } },
        relations: {
          requestWorkflowType: true,
          notification: true
        }
      });
    }
  }

  async getApprovalStatusByWorkflowTypeAndEmployeeId(
    workflowType: RequestWorkFlowType,
    employeeId: number
  ) {
    const approvalStatus = await this.dataSource
      .getRepository(ApprovalStatus)
      .findOne({
        where: {
          status: ApprovalStatusEnum.PENDING,
          requestWorkflowType: { id: workflowType.id },
          employee: { id: employeeId }
        },
        relations: {
          requestWorkflowType: true,
          employee: true
        }
      });

    if (!approvalStatus) {
      throw new ResourceNotFoundException(
        `Resource approval status of employee ${employeeId} not found.`
      );
    }

    return approvalStatus;
  }

  /**
   * This function is used to get approval status from admin user when view approval status.
   * @param entityId
   * @param status
   * @param entityType
   */
  async findOneForAdmin(
    entityId: number,
    status: ApprovalStatusEnum,
    entityType: WorkflowTypeEnum
  ): Promise<ApprovalStatus | null> {
    return await this.dataSource.getRepository(ApprovalStatus).findOne({
      where: {
        entityId,
        status,
        requestWorkflowType: { requestType: entityType },
        employee: { positions: { isMoved: false } }
      },
      order: { id: 'DESC' },
      relations: {
        requestWorkflowType: true,
        requestApprovalWorkflow: {
          requestWorkflowLevel: {
            companyStructureDepartment: true,
            companyStructureTeam: true,
            positionLevel: true
          }
        },
        employee: {
          positions: {
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructureTeam: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true }
          }
        }
      }
    });
  }

  /**
   * This function is used to get approval status by id.
   * @param id
   */
  async findOneById(id: number) {
    return this.dataSource.getRepository(ApprovalStatus).findOne({
      where: {
        id,
        employee: { positions: { isMoved: false } }
      },
      relations: {
        requestWorkflowType: true,
        requestApprovalWorkflow: {
          requestWorkflowLevel: {
            companyStructureDepartment: true,
            companyStructureTeam: true,
            positionLevel: true
          }
        },
        employee: {
          positions: {
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructureTeam: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true }
          }
        }
      }
    });
  }

  /**
   * Function is used to get approval status by given id.
   * If id is not given, it will throw error.
   * @param id
   */
  async findOneByIdForUpdate(
    id: number,
    employee: Employee
  ): Promise<ApprovalStatus> {
    const {
      employeeDepartmentIds,
      originalTeamIds,
      positionLevelIds,
      teamMpath
    } = this.utilityService.mappingEmployeeMpath(employee);

    const approvalStatusCrossDepartmentCondition: FindOptionsWhere<ApprovalStatus> =
      {
        id,
        employee: {
          positions: {
            isMoved: false
          }
        },
        requestApprovalWorkflow: {
          requestWorkflowLevel: {
            companyStructureDepartment: {
              id: Raw(
                (id) => `(${id} IS NULL OR ${id} IN(${employeeDepartmentIds}))`
              )
            },
            companyStructureTeam: {
              id: Raw((id) => `(${id} IS NULL OR ${id} IN(${originalTeamIds}))`)
            },
            type: In([
              TypeEnum.FIRST_APPROVALS,
              TypeEnum.SECOND_APPROVALS,
              TypeEnum.ACKNOWLEDGERS
            ]),
            positionLevel: {
              id: In(positionLevelIds)
            }
          }
        }
      };

    const approvalStatusSameDepartmentCondition: FindOptionsWhere<ApprovalStatus> =
      {
        id,
        employee: {
          positions: {
            isMoved: false,
            mpath:
              this.utilityService.generateScriptToCheckTeamMpath(teamMpath),
            companyStructureDepartment: {
              id: In(employeeDepartmentIds)
            }
          }
        },
        requestApprovalWorkflow: {
          requestWorkflowLevel: {
            type: In([
              TypeEnum.FIRST_APPROVALS,
              TypeEnum.SECOND_APPROVALS,
              TypeEnum.ACKNOWLEDGERS
            ]),
            positionLevel: {
              id: In(positionLevelIds)
            }
          }
        }
      };

    const approvalStatusQueryRelation: FindOptionsRelations<ApprovalStatus> = {
      requestWorkflowType: true,
      requestApprovalWorkflow: {
        requestWorkflowLevel: {
          companyStructureDepartment: true,
          companyStructureTeam: true,
          positionLevel: true
        }
      },
      employee: {
        positions: {
          companyStructureLocation: { companyStructureComponent: true },
          companyStructureOutlet: { companyStructureComponent: true },
          companyStructureDepartment: { companyStructureComponent: true },
          companyStructureTeam: { companyStructureComponent: true },
          companyStructurePosition: { companyStructureComponent: true }
        }
      }
    };

    const approvalStatus: ApprovalStatus | null = await this.dataSource
      .getRepository(ApprovalStatus)
      .findOne({
        where: [
          approvalStatusCrossDepartmentCondition,
          approvalStatusSameDepartmentCondition
        ],
        relations: approvalStatusQueryRelation
      });

    if (!approvalStatus) {
      throw new ResourceNotFoundException(this.APPROVAL_STATUS, id);
    }

    return approvalStatus;
  }

  /**
   * Function is used to check when user rejects approval status.
   * When user rejects without reason, throw error.
   * @param updateApprovalStatusTrackingDto
   */
  checkRejectApprovalStatusWithoutReason(
    updateApprovalStatusTrackingDto: UpdateApprovalStatusTrackingDto
  ) {
    const isRejectedWithoutReason: boolean =
      !updateApprovalStatusTrackingDto.approvalResult &&
      !updateApprovalStatusTrackingDto.reason;

    if (isRejectedWithoutReason) {
      throw new ResourceNotFoundException(this.REJECT_ERROR_MESSAGE);
    }
  }
}
