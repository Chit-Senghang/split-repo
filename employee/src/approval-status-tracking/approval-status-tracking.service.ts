import { Inject, Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOperator,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  QueryRunner,
  Raw
} from 'typeorm';
import { getCurrentDate } from '../shared-resources/common/utils/date-utils';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { RequestApprovalWorkflowLevel } from '../request-approval-workflow/entities/request-approval-workflow-level.entity';
import { ResourceNotFoundException } from '../shared-resources/exception/resource-not-found.exception';
import { TypeEnum } from '../request-approval-workflow/common/ts/enum/type.enum';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { fromDateToDateConverter } from '../shared-resources/utils/validate-date-format';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeWarningService } from '../employee-warning/employee-warning.service';
import { EmployeeResignationService } from '../employee-resignation/employee-resignation.service';
import { DayOffRequestService } from '../leave/day-off-request/day-off-request.service';
import { MissedScanRequestService } from '../attendance/missed-scan-request/missed-scan-request.service';
import { MissionRequestService } from '../leave/mission-request/mission-request.service';
import { LeaveRequestService } from '../leave/leave-request/leave-request.service';
import { BorrowOrPaybackService } from '../attendance/borrow-or-payback/borrow-or-payback.service';
import { OvertimeRequestService } from '../attendance/overtime-request/overtime-request.service';
import { GrpcService } from '../grpc/grpc.service';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { EmployeeMovementService } from '../employee-movement/employee-movement.service';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { PayrollDeductionService } from '../payroll-deduction/payroll-deduction.service';
import { PayrollBenefitAdjustmentService } from '../payroll-benefit-adjustment/payroll-benefit-adjustment.service';
import { EMPLOYEE_SELECTED_FIELDS } from '../employee/constant/selected-fields.constant';
import { WorkflowTypeEnum } from '../shared-resources/common/enum/workflow-type.enum';
import { UpdateEmployeeDto } from '../employee/dto/update-employee.dto';
import { UtilityService } from '../utility/utility.service';
import { RequestApprovalWorkflow } from '../request-approval-workflow/entities/request-approval-workflow.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { IFirebaseMessage } from '../firebase/dto/firebase-payload.dto';
import { NotificationService } from '../notification/notification.service';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { RequestWorkFlowTypeRepository } from '../request-workflow-type/repository/request-workflow-type.repository';
import { IRequestWorkFlowTypeRepository } from '../request-workflow-type/repository/interface/request-workflow-type.repository.interface';
import { RequestApprovalWorkflowLevelRepository } from '../request-approval-workflow/repository/request-approval-workflow-level.repository';
import { IRequestApprovalWorkflowLevelRepository } from '../request-approval-workflow/repository/interface/request-approval-workflow-level.repository.interface';
import { EmployeeActiveStatusEnum } from '../employee/enum/employee-status.enum';
import { EmployeeMovementStatusEnum } from '../employee-movement/ts/enums/movement-status.enum';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { ActionTypeEnum } from './common/ts/enum/action-type.enum';
import { ApprovalStatusTrackingPagination } from './dto/pagination-approval-status-tracking.dto';
import { ApprovalStatus } from './entities/approval-status-tracking.entity';
import { UpdateApprovalStatusTrackingDto } from './dto/update-approval-status-tracking.dto';
import { ApprovalStatusTrackingValidationService } from './approval-status-tracking-validation.service';
import { ApprovalStatusEnum } from './common/ts/enum/approval-status.enum';
import { ApprovalStatusRepository } from './repository/approval-status.repository';
import { IApprovalStatusRepository } from './repository/interface/approval-status.repository.interface';

@Injectable()
export class ApprovalStatusTrackingService {
  private readonly INELIGIBLE_POSITION =
    'Your position does not match with workflow.';

  constructor(
    @Inject(ApprovalStatusRepository)
    private readonly approvalStatusRepo: IApprovalStatusRepository,
    @Inject(RequestWorkFlowTypeRepository)
    private readonly requestWorkflowTypeRepo: IRequestWorkFlowTypeRepository,
    @Inject(RequestApprovalWorkflowLevelRepository)
    private readonly approvalWorkflowLevelRepository: IRequestApprovalWorkflowLevelRepository,
    private readonly dataSource: DataSource,
    private readonly employeeService: EmployeeService,
    private readonly employeeWarningService: EmployeeWarningService,
    private readonly employeeResignationService: EmployeeResignationService,
    private readonly dayOffRequestService: DayOffRequestService,
    private readonly missedScanRequestService: MissedScanRequestService,
    private readonly missionRequestService: MissionRequestService,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly borrowOrPaybackService: BorrowOrPaybackService,
    private readonly overtimeRequestService: OvertimeRequestService,
    private readonly employeeMovementService: EmployeeMovementService,
    private readonly grpcService: GrpcService,
    private readonly payrollDeductionService: PayrollDeductionService,
    private readonly payrollBenefitAdjustmentService: PayrollBenefitAdjustmentService,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService,
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationService: NotificationService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async mappingApproversResponse(approvalStatus: ApprovalStatus) {
    return {
      createdBy: await this.validateUser(approvalStatus.createdBy),
      firstApprovalUser:
        approvalStatus.firstApprovalUserId &&
        (await this.validateUser(approvalStatus.firstApprovalUserId)),
      secondApprovalUser:
        approvalStatus.secondApprovalUserId &&
        (await this.validateUser(approvalStatus.secondApprovalUserId)),
      acknowledgeUser:
        approvalStatus.acknowledgeUserId &&
        (await this.validateUser(approvalStatus.acknowledgeUserId))
    };
  }

  validateUser = async (id: number) => {
    const user = await this.grpcService.getUserById(id);
    if (!user) {
      throw new ResourceNotFoundException('user', id);
    }

    let employee: Employee;
    if (user.isSelfService) {
      //AVOID: validate if not found employee
      employee = await this.employeeRepo.getEmployeeByUserId(user.id, false);
    }
    return {
      id: user.id,
      username: user.username,
      employee: employee
        ? {
            id: employee.id,
            displayNameEn: employee.displayFullNameEn,
            displayNameKh: employee.displayFullNameKh
          }
        : null
    };
  };

  checkPaginationDateRange(pagination: ApprovalStatusTrackingPagination): {
    fromDate: Date;
    toDate: Date;
  } {
    if (pagination.fromDate) {
      if (!pagination.toDate) {
        throw new ResourceNotFoundException(
          'query dateRage',
          'toDate is required'
        );
      }
    }

    if (pagination.toDate) {
      if (!pagination.fromDate) {
        throw new ResourceNotFoundException(
          'query dateRage',
          'fromDate is required'
        );
      }
    }

    let fromDate: Date;
    let toDate: Date;
    if (pagination.toDate && pagination.fromDate) {
      fromDate = fromDateToDateConverter(pagination.fromDate, 'fromDate');
      toDate = fromDateToDateConverter(pagination.toDate, 'toDate');
    }

    return { fromDate, toDate };
  }

  async findOne(id: number) {
    return await this.approvalStatusRepo.getOne(id);
  }

  async findOneByEntityIdAndType(
    entityId: number,
    entityType: WorkflowTypeEnum,
    status: ApprovalStatusEnum
  ) {
    return await this.approvalStatusRepo.getOneForView(
      entityId,
      status,
      entityType
    );
  }

  async update(
    id: number,
    updateApprovalStatusTrackingDto: UpdateApprovalStatusTrackingDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.utilityService.getEmployeeByCurrentUser();

      // no employee meaning admin user or ineligible user.
      if (!employee) {
        throw new ResourceForbiddenException(this.INELIGIBLE_POSITION);
      }

      const approvalStatus: ApprovalStatus = //matching records with current employee login
        await this.approvalStatusValidationService.findOneByIdForUpdate(
          id,
          employee
        );

      this.approvalStatusValidationService.checkRejectApprovalStatusWithoutReason(
        updateApprovalStatusTrackingDto // check when reject without reason
      );

      // get approver type in order to add user id to record
      const responseMapping = await this.mappingResponse(
        approvalStatus,
        employee
      );

      // create dto to update when user approve
      const updatedApprovalStatusDto = await this.createUpdateApproverDto(
        approvalStatus,
        updateApprovalStatusTrackingDto,
        employee.userId,
        responseMapping.approverType
      );

      const updatedApprovalStatus = await queryRunner.manager.create(
        ApprovalStatus,
        updatedApprovalStatusDto
      );

      const updatedResult = await queryRunner.manager.save(
        updatedApprovalStatus
      );

      // send notification after record has been updated, but still PENDING.
      if (updatedApprovalStatus.status === ApprovalStatusEnum.PENDING) {
        this.sendNotificationForApproverOrAcknowledger(approvalStatus);
      }

      const statusCondition: ApprovalStatusEnum[] = [
        ApprovalStatusEnum.ACTIVE,
        ApprovalStatusEnum.REJECTED
      ];

      // change records status and send notification when updated result is either ACTIVE or REJECTED
      if (statusCondition.includes(updatedResult.status)) {
        // send notification to creator and record owner
        await this.sendNotificationWhenRecordActiveOrRejected(approvalStatus);

        await this.changeDataInOwnerTable(updatedResult, queryRunner);
      }

      await queryRunner.commitTransaction();

      return updatedResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async changeDataInOwnerTable(
    approvalStatus: ApprovalStatus,
    queryRunner: QueryRunner
  ) {
    const isActiveOrRejected: boolean =
      approvalStatus.status === ApprovalStatusEnum.ACTIVE ||
      approvalStatus.status === ApprovalStatusEnum.REJECTED;

    switch (approvalStatus.requestWorkflowType.requestType) {
      case RequestWorkFlowTypeEnum.BORROW: {
        if (isActiveOrRejected) {
          return await this.borrowOrPaybackService.grpcUpdateStatus({
            id: approvalStatus.entityId,
            type: RequestWorkFlowTypeEnum.BORROW,
            status: approvalStatus.status
          });
        }
        break;
      }
      case RequestWorkFlowTypeEnum.MISSED_SCAN: {
        if (isActiveOrRejected) {
          return await this.missedScanRequestService.grpcUpdateStatus({
            id: approvalStatus.entityId,
            type: RequestWorkFlowTypeEnum.MISSED_SCAN,
            status: approvalStatus.status
          });
        }
        break;
      }
      case RequestWorkFlowTypeEnum.OVERTIME_REQUEST: {
        if (isActiveOrRejected) {
          return await this.overtimeRequestService.grpcUpdateStatus({
            id: approvalStatus.entityId,
            type: RequestWorkFlowTypeEnum.OVERTIME_REQUEST,
            status: approvalStatus.status
          });
        }
        break;
      }
      case RequestWorkFlowTypeEnum.EMPLOYEE_INFO_UPDATE: {
        //update employee information only when approval status is active
        if (approvalStatus.status === ApprovalStatusEnum.ACTIVE) {
          const employeeUpdate: UpdateEmployeeDto = JSON.parse(
            approvalStatus.requestChangeOriginalJson
          );
          return await this.employeeService.grpcUpdateEmployee(employeeUpdate);
        }
        break;
      }
      case RequestWorkFlowTypeEnum.LEAVE_REQUEST: {
        if (isActiveOrRejected) {
          return await this.leaveRequestService.updateLeaveRequestStatus(
            approvalStatus.entityId,
            approvalStatus.status
          );
        }
        break;
      }
      case RequestWorkFlowTypeEnum.MISSION_REQUEST: {
        if (isActiveOrRejected) {
          return await this.missionRequestService.updateMissionRequestStatus(
            approvalStatus.entityId,
            approvalStatus.status
          );
        }
        break;
      }
      case RequestWorkFlowTypeEnum.MOVEMENT: {
        let status = EmployeeMovementStatusEnum.ACTIVE;
        if (approvalStatus.status !== ApprovalStatusEnum.ACTIVE) {
          status = EmployeeMovementStatusEnum.REJECTED;
        }
        if (isActiveOrRejected) {
          await this.employeeMovementService.updateEmployeeMovementStatus(
            approvalStatus.entityId,
            queryRunner,
            status
          );
        }
        break;
      }
      case RequestWorkFlowTypeEnum.RESIGNATION_REQUEST: {
        if (isActiveOrRejected) {
          await this.employeeResignationService.updateEmployeeResignationStatus(
            approvalStatus.entityId
          );
        }
        break;
      }
      case RequestWorkFlowTypeEnum.DAY_OFF_REQUEST: {
        if (isActiveOrRejected) {
          await this.dayOffRequestService.grpcUpdateStatus({
            id: approvalStatus.entityId,
            status: approvalStatus.status
          });
        }
        break;
      }
      case RequestWorkFlowTypeEnum.WARNING: {
        if (isActiveOrRejected) {
          await this.employeeWarningService.grpcUpdateEmployeeWarningStatus({
            id: approvalStatus.entityId,
            status: approvalStatus.status
          });
        }
        break;
      }
      case RequestWorkFlowTypeEnum.PAYROLL_BENEFIT_ADJUSTMENT: {
        if (isActiveOrRejected) {
          await this.payrollBenefitAdjustmentService.updateStatus(
            approvalStatus.entityId,
            approvalStatus.status
          );
        }
        break;
      }
      case RequestWorkFlowTypeEnum.PAYROLL_DEDUCTION: {
        if (isActiveOrRejected) {
          await this.payrollDeductionService.updatePayrollDeductionStatus(
            approvalStatus.entityId,
            approvalStatus.status
          );
        }
        break;
      }
      default:
        break;
    }
  }

  createUpdateApproverDto = async (
    approvalStatus: ApprovalStatus,
    updateApprovalStatusTrackingDto: UpdateApprovalStatusTrackingDto,
    userId: number,
    approvalType: TypeEnum
  ) => {
    const requestWorkflowLevels: RequestApprovalWorkflowLevel[] =
      await this.approvalWorkflowLevelRepository.find({
        where: {
          requestApprovalWorkflow: {
            id: approvalStatus.requestApprovalWorkflow.id
          },
          type: In([
            TypeEnum.FIRST_APPROVALS,
            TypeEnum.SECOND_APPROVALS,
            TypeEnum.ACKNOWLEDGERS
          ])
        },
        relations: {
          requestApprovalWorkflow: true
        }
      });

    const uniqueArray = [];

    requestWorkflowLevels.forEach((obj: RequestApprovalWorkflowLevel) => {
      const value = obj.type;

      if (!uniqueArray.some((item) => item.type === value)) {
        uniqueArray.push(obj);
      }
    });

    const workflowLevels = uniqueArray;

    let approvalStatusDto: any;
    const dateTime = getCurrentDate().toDate();
    let resultStatus = ApprovalStatusEnum.PENDING;
    if (updateApprovalStatusTrackingDto.approvalResult) {
      resultStatus = this.validateNumberOfApprovers(
        approvalStatus,
        workflowLevels.length,
        approvalType
      );
    } else {
      resultStatus = ApprovalStatusEnum.REJECTED;
    }

    switch (approvalType) {
      case TypeEnum.FIRST_APPROVALS: {
        approvalStatusDto = Object.assign(approvalStatus, {
          firstApprovalUserId: userId,
          firstApprovalReason: updateApprovalStatusTrackingDto.reason,
          firstApprovalResult: updateApprovalStatusTrackingDto.approvalResult,
          firstApprovalDate: dateTime,
          status: resultStatus
        });
        break;
      }
      case TypeEnum.SECOND_APPROVALS: {
        approvalStatusDto = Object.assign(approvalStatus, {
          secondApprovalUserId: userId,
          secondApprovalReason: updateApprovalStatusTrackingDto.reason,
          secondApprovalResult: updateApprovalStatusTrackingDto.approvalResult,
          secondApprovalDate: dateTime,
          status: resultStatus
        });
        break;
      }
      case TypeEnum.ACKNOWLEDGERS: {
        approvalStatusDto = Object.assign(approvalStatus, {
          acknowledgeUserId: userId,
          acknowledgeDate: dateTime,
          acknowledgeResult: updateApprovalStatusTrackingDto.approvalResult,
          status: resultStatus
        });
        break;
      }
      default:
        break;
    }
    return approvalStatusDto;
  };

  validateNumberOfApprovers = (
    approvalStatus: ApprovalStatus,
    approvers: number,
    type: TypeEnum
  ) => {
    let status: ApprovalStatusEnum = ApprovalStatusEnum.PENDING;

    switch (type) {
      case TypeEnum.FIRST_APPROVALS: {
        if (approvers === 3) {
          if (
            approvalStatus.secondApprovalUserId &&
            approvalStatus.acknowledgeUserId
          ) {
            status = ApprovalStatusEnum.ACTIVE;
          }
        } else if (approvers === 2) {
          if (
            approvalStatus.acknowledgeUserId ||
            approvalStatus.secondApprovalUserId
          ) {
            status = ApprovalStatusEnum.ACTIVE;
          }
        } else {
          status = ApprovalStatusEnum.ACTIVE;
        }
        break;
      }
      case TypeEnum.SECOND_APPROVALS: {
        if (approvers === 3) {
          if (
            approvalStatus.firstApprovalUserId &&
            approvalStatus.acknowledgeUserId
          ) {
            status = ApprovalStatusEnum.ACTIVE;
          }
        } else if (approvers === 2) {
          if (
            approvalStatus.acknowledgeUserId ||
            approvalStatus.firstApprovalUserId
          ) {
            status = ApprovalStatusEnum.ACTIVE;
          }
        } else {
          status = ApprovalStatusEnum.ACTIVE;
        }
        break;
      }
      case TypeEnum.ACKNOWLEDGERS: {
        if (approvers === 3) {
          if (
            approvalStatus.firstApprovalUserId &&
            approvalStatus.secondApprovalUserId
          ) {
            status = ApprovalStatusEnum.ACTIVE;
          }
        } else if (approvers === 2) {
          if (
            approvalStatus.secondApprovalUserId ||
            approvalStatus.firstApprovalUserId
          ) {
            status = ApprovalStatusEnum.ACTIVE;
          }
        } else {
          status = ApprovalStatusEnum.ACTIVE;
        }
        break;
      }
    }
    return status;
  };

  async exportFile(
    pagination: ApprovalStatusTrackingPagination,
    exportFileDto: ExportFileDto
  ) {
    const { data } =
      await this.getApprovalWorkflowForCurrentEmployee(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.APPROVAL_REQUEST_LIST,
      exportFileDto,
      data
    );
  }

  async getApprovalWorkflowForCurrentEmployee(
    pagination: ApprovalStatusTrackingPagination
  ) {
    const { fromDate, toDate } = this.checkPaginationDateRange(pagination);
    let createdAtCondition: FindOperator<Date> | undefined;
    if (pagination.fromDate && pagination.toDate) {
      createdAtCondition = Between(fromDate, toDate);
    }

    let statusCondition = ApprovalStatusEnum.PENDING;
    if (pagination.status) {
      statusCondition = pagination.status;
    }

    const employeeCondition = {
      status: In(Object.values(EmployeeActiveStatusEnum)),
      positions: {
        isMoved: false,
        companyStructureLocation: {
          id: pagination.locationId
        },
        companyStructureOutlet: {
          id: pagination.outletId
        },
        companyStructureDepartment: {
          id: pagination.departmentId
        },
        companyStructureTeam: {
          id: pagination.teamId
        },
        companyStructurePosition: {
          id: pagination.positionId
        }
      }
    } as FindOptionsWhere<Employee>;

    // check condition of admin or self service user
    const employee: Employee = await this.getCurrentEmployee();
    let approvalStatusCondition: FindOptionsWhere<ApprovalStatus>;
    if (!employee) {
      approvalStatusCondition = {
        createdBy: pagination.requesterId,
        createdAt: createdAtCondition,
        requestWorkflowType: { id: pagination.requestWorkflowTypeId },
        entityId: pagination.entityId,
        status: statusCondition,
        employee: employeeCondition
      } as FindOptionsWhere<ApprovalStatus>;
    } else {
      //get information of mpath of employee
      const {
        employeeDepartmentIds,
        originalTeamIds,
        positionLevelIds,
        teamMpath
      } = this.utilityService.mappingEmployeeMpath(employee);

      let createdByCondition: number | FindOperator<number> | undefined;
      if (pagination.requesterId) {
        createdByCondition = Not(employee.userId);
      }

      const approverType = In([
        TypeEnum.FIRST_APPROVALS,
        TypeEnum.SECOND_APPROVALS,
        TypeEnum.ACKNOWLEDGERS
      ]);
      // condition when workflow is cross department
      const requestApprovalWorkflowWithCrossDepartment = {
        requestWorkflowLevel: {
          companyStructureDepartment: {
            id: Raw((departmentId) => {
              return `(${departmentId} IS NULL OR ${departmentId} IN(${employeeDepartmentIds}))`;
            })
          },
          companyStructureTeam: {
            id: Raw((teamId) => {
              return `(${teamId} IS NULL OR ${teamId} IN(${originalTeamIds}))`;
            })
          },
          positionLevel: {
            id: In(positionLevelIds)
          },
          type: approverType
        }
      } as FindOptionsWhere<RequestApprovalWorkflow>;

      // check employee position when workflow is not cross department
      const employeeConditionWithoutCrossDepartment = {
        positions: {
          isMoved: false,
          mpath: this.utilityService.generateScriptToCheckTeamMpath(teamMpath),
          companyStructureLocation: {
            id: pagination.locationId
          },
          companyStructureOutlet: {
            id: pagination.outletId
          },
          companyStructureDepartment: {
            id: pagination.departmentId
              ? pagination.departmentId
              : In(employeeDepartmentIds)
          },
          companyStructureTeam: {
            id: pagination.teamId
          },
          companyStructurePosition: {
            id: pagination.positionId
          }
        }
      } as FindOptionsWhere<Employee>;

      // condition of approver and acknowledger
      let firstApprovalUserCondition: FindOperator<any>;
      let secondApprovalUserCondition: FindOperator<any>;
      let acknowledgeUserCondition: FindOperator<any>;
      if (pagination?.status === ApprovalStatusEnum.PENDING) {
        firstApprovalUserCondition = Raw(
          (firstApprovalUserId) =>
            ` CASE WHEN ${firstApprovalUserId} IS NOT NULL THEN ${firstApprovalUserId} != ${employee.userId} 
            ELSE ${firstApprovalUserId} IS NULL
            END`
        );

        secondApprovalUserCondition = Raw(
          (secondApprovalUserId) =>
            ` CASE WHEN ${secondApprovalUserId} IS NOT NULL THEN ${secondApprovalUserId} != ${employee.userId} 
            ELSE ${secondApprovalUserId} IS NULL
            END`
        );

        acknowledgeUserCondition = Raw(
          (acknowledgeUserId) =>
            `CASE WHEN ${acknowledgeUserId} IS NOT NULL THEN ${acknowledgeUserId} != ${employee.userId} 
            ELSE ${acknowledgeUserId} IS NULL
            END`
        );
      }

      approvalStatusCondition = [
        {
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          employee: { id: employee.id }, //FOR: owner to see their own records
          status: statusCondition,
          requestWorkflowType: { id: pagination.requestWorkflowTypeId },
          entityId: pagination.entityId
        },
        {
          createdAt: createdAtCondition,
          createdBy: createdByCondition ?? employee.userId, //FOR: creator to see the records,
          status: statusCondition,
          requestWorkflowType: { id: pagination.requestWorkflowTypeId },
          entityId: pagination.entityId
        },
        {
          createdBy: createdByCondition,
          createdAt: createdAtCondition,
          status: statusCondition,
          firstApprovalUserId: firstApprovalUserCondition,
          secondApprovalUserId: secondApprovalUserCondition,
          acknowledgeUserId: acknowledgeUserCondition,
          employee: employeeCondition,
          requestWorkflowType: { id: pagination.requestWorkflowTypeId },
          entityId: pagination.entityId,
          requestApprovalWorkflow: requestApprovalWorkflowWithCrossDepartment
        },
        {
          createdBy: createdByCondition,
          createdAt: createdAtCondition,
          firstApprovalUserId: firstApprovalUserCondition,
          secondApprovalUserId: secondApprovalUserCondition,
          acknowledgeUserId: acknowledgeUserCondition,
          requestWorkflowType: { id: pagination.requestWorkflowTypeId },
          entityId: pagination.entityId,
          status: statusCondition,
          employee: employeeConditionWithoutCrossDepartment,
          requestApprovalWorkflow: {
            requestWorkflowLevel: {
              positionLevel: {
                id: In(positionLevelIds)
              },
              companyStructureDepartment: {
                id: IsNull()
              },
              companyStructureTeam: {
                id: IsNull()
              },
              type: approverType
            }
          }
        }
      ] as FindOptionsWhere<ApprovalStatus>;
    }

    const approvalStatus = await this.approvalStatusRepo.findAllWithPagination(
      pagination,
      [],
      {
        where: approvalStatusCondition,
        relation: {
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
        },
        select: {
          employee: EMPLOYEE_SELECTED_FIELDS,
          requestWorkflowType: {
            id: true,
            requestType: true,
            description: true
          },
          requestApprovalWorkflow: {
            id: true,
            requestWorkflowLevel: {
              id: true,
              type: true,
              companyStructureDepartment: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              },
              companyStructureTeam: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              },
              positionLevel: {
                id: true
              }
            }
          }
        }
      }
    );

    return {
      data: await Promise.all(
        approvalStatus.data.map((data: ApprovalStatus) => {
          return this.mappingResponse(data, employee);
        })
      ),
      totalCount: approvalStatus.totalCount
    };
  }

  convertActionButton(type: TypeEnum) {
    if (
      type === TypeEnum.FIRST_APPROVALS ||
      type === TypeEnum.SECOND_APPROVALS
    ) {
      return ActionTypeEnum['APPROVAL/REJECT'];
    } else if (type === TypeEnum.ACKNOWLEDGERS) {
      return ActionTypeEnum.ACKNOWLEDGE;
    } else {
      return ActionTypeEnum.NO;
    }
  }

  getTeamIdFromMpath(employeeMpaths: string[], teamIds: number[]) {
    employeeMpaths.map((mpath: string) => {
      const structure = mpath.split('.');

      const isPositionLevel = structure[structure.length - 1].includes('L');

      if (isPositionLevel) {
        const temp = structure.slice(4, -1);
        temp.forEach((item: string) => teamIds.push(Number(item)));
      } else {
        const temp = structure.splice(4, -2);
        temp.forEach((item: string) => teamIds.push(Number(item)));
      }
    });

    return teamIds;
  }

  async getCurrentEmployee(): Promise<Employee> {
    const userId = getCurrentUserFromContext();
    const user = await this.grpcService.getUserById(userId);

    if (!user.isSelfService) {
      return;
    }

    return await this.employeeRepo.getEmployeeByUserId(userId);
  }

  // Private block functions

  /**
   * This function is used to check how many positions of employee matches with workflow.
   * @param requestApprovalWorkflowLevels
   */
  private positionsMatchedWithWorkflow(
    requestApprovalWorkflowLevels: RequestApprovalWorkflowLevel[]
  ): TypeEnum[] {
    return requestApprovalWorkflowLevels.map(
      (requestApprovalWorkflowLevel) => requestApprovalWorkflowLevel.type
    );
  }

  /**
   * This function is used to check which action employee matches
   * in case employee positions matches two or more actions.
   * @param approvalStatus
   */
  private checkActionEmployee(approvalStatus: ApprovalStatus) {
    const eligibleTypes = this.positionsMatchedWithWorkflow(
      approvalStatus.requestApprovalWorkflow.requestWorkflowLevel
    );

    if (
      eligibleTypes.includes(TypeEnum.FIRST_APPROVALS) &&
      !approvalStatus.firstApprovalUserId
    ) {
      return TypeEnum.FIRST_APPROVALS;
    } else if (
      eligibleTypes.includes(TypeEnum.SECOND_APPROVALS) &&
      !approvalStatus.secondApprovalUserId
    ) {
      return TypeEnum.SECOND_APPROVALS;
    } else if (
      eligibleTypes.includes(TypeEnum.ACKNOWLEDGERS) &&
      !approvalStatus.acknowledgeUserId
    ) {
      return TypeEnum.ACKNOWLEDGERS;
    } else {
      return TypeEnum.FIRST_APPROVALS;
    }
  }

  private async mappingResponse(
    approvalStatus: ApprovalStatus,
    employee: Employee
  ) {
    return {
      id: approvalStatus.id,
      createdAt: approvalStatus.createdAt,
      updatedAt: approvalStatus.updatedAt,
      updatedBy: approvalStatus.updatedBy,
      status: approvalStatus.status,
      requestToUpdateChanges: approvalStatus?.requestToUpdateChanges
        ? JSON.parse(approvalStatus.requestToUpdateChanges)
        : null,
      requestToUpdateJson: approvalStatus?.requestToUpdateJson
        ? JSON.parse(approvalStatus.requestToUpdateJson)
        : null,
      ...(await this.mappingApproversResponse(approvalStatus)),
      entityId: {
        id: approvalStatus.entityId,
        displayFullNameEn: approvalStatus.employee.displayFullNameEn,
        accountNo: approvalStatus.employee.accountNo,
        ...this.mapEmployeePositionToDisplayDefaultPosition(
          approvalStatus.employee.positions
        ),
        employeeId: approvalStatus.employee.id
      },
      firstApprovalReason: approvalStatus.firstApprovalReason,
      firstApprovalDate: approvalStatus.firstApprovalDate,
      secondApprovalReason: approvalStatus.secondApprovalReason,
      secondApprovalDate: approvalStatus.secondApprovalDate,
      acknowledgeDate: approvalStatus.acknowledgeDate,
      requestApprovalWorkflow: {
        id: approvalStatus.requestApprovalWorkflow.id
      },
      requestWorkflowType: {
        id: approvalStatus.requestWorkflowType.id,
        requestType: approvalStatus.requestWorkflowType.requestType,
        description: approvalStatus.requestWorkflowType.description
      },
      actionType: this.approvalStatusRepo.checkEmployeeIsEligibleInWorkflow(
        approvalStatus,
        employee
      ),
      approverType: this.checkActionEmployee(approvalStatus)
    };
  }

  /**
   * This function is used to send notification to record owner and creator
   * when record is either ACTIVE or REJECTED
   * @param employee
   * @param approvalStatus
   */
  private async sendNotificationWhenRecordActiveOrRejected(
    approvalStatus: ApprovalStatus
  ) {
    let creatorMessage = '';
    let ownerRecordMessage = '';

    if (approvalStatus.status === ApprovalStatusEnum.ACTIVE) {
      creatorMessage = 'has been approved.';
      ownerRecordMessage = 'for you has been approved.';
    } else {
      creatorMessage = 'has been rejected.';
      ownerRecordMessage = 'for you has been rejected.';
    }

    const body = {
      name: 'The request',
      content: creatorMessage
    };

    // send to creator
    const creatorPayload: IFirebaseMessage = {
      topic: approvalStatus?.createdBy.toString(),
      notification: body
    };

    await this.notificationService.create({
      title: JSON.stringify(body),
      userId: approvalStatus?.createdBy,
      entityId: null,
      entityType: approvalStatus.requestWorkflowType.requestType,
      approvalStatusId: approvalStatus.id,
      description: null
    });

    await this.firebaseService.sendMessage(creatorPayload);

    // send to record owner
    if (
      approvalStatus.status === ApprovalStatusEnum.ACTIVE &&
      approvalStatus.employee.userId !== approvalStatus?.createdBy
    ) {
      const body = {
        name: 'The request',
        content: ownerRecordMessage
      };

      const ownerPayload: IFirebaseMessage = {
        topic: approvalStatus.employee.userId.toString(),
        notification: body
      };

      await this.notificationService.create({
        title: JSON.stringify(body),
        userId: approvalStatus.employee.userId,
        entityId: null,
        entityType: approvalStatus.requestWorkflowType.requestType,
        approvalStatusId: approvalStatus.id,
        description: null
      });

      await this.firebaseService.sendMessage(ownerPayload);
    }
  }

  private async sendNotificationForApproverOrAcknowledger(
    approvalStatus: ApprovalStatus
  ) {
    const hasSecondApprover = await this.getRequestWorkflowLevelByType(
      approvalStatus.requestApprovalWorkflow.id,
      TypeEnum.SECOND_APPROVALS
    );
    // second approver has not approved yet
    if (!approvalStatus.secondApprovalUserId && hasSecondApprover) {
      await this.sendNotificationToEmployeesInWorkflow(
        approvalStatus,
        TypeEnum.SECOND_APPROVALS
      );
    } else if (!approvalStatus.acknowledgeUserId) {
      // send notification to acknowledger
      await this.sendNotificationToEmployeesInWorkflow(
        approvalStatus,
        TypeEnum.ACKNOWLEDGERS
      );
    }
  }

  private async sendNotificationToEmployeesInWorkflow(
    approvalStatus: ApprovalStatus,
    type: TypeEnum
  ) {
    const employeeOwner = await this.employeeRepo.getEmployeeById(
      approvalStatus.employee.id
    );

    const creatorEmployee = await this.employeeRepo.getEmployeeByUserId(
      approvalStatus.createdBy
    );

    if (employeeOwner?.positions) {
      for (const position of employeeOwner.positions) {
        await this.utilityService.checkEmployeesInWorkflow(
          position,
          approvalStatus.requestApprovalWorkflow.id,
          approvalStatus.id,
          type,
          creatorEmployee
        );
      }
    }
  }

  private async getRequestWorkflowLevelByType(
    requestApprovalWorkflowId: number,
    type: TypeEnum
  ) {
    return await this.approvalWorkflowLevelRepository.findOne({
      where: {
        requestApprovalWorkflow: { id: requestApprovalWorkflowId },
        type
      }
    });
  }

  private mapEmployeePositionToDisplayDefaultPosition(
    employeePosition: EmployeePosition[]
  ) {
    const employeeDefaultPosition = employeePosition.find(
      (position) => position.isDefaultPosition === true
    );
    if (employeeDefaultPosition) {
      return {
        location:
          employeeDefaultPosition.companyStructureLocation
            .companyStructureComponent.name,
        outlet:
          employeeDefaultPosition.companyStructureOutlet
            .companyStructureComponent.name,
        department:
          employeeDefaultPosition.companyStructureDepartment
            .companyStructureComponent.name,
        team: employeeDefaultPosition.companyStructureTeam
          .companyStructureComponent.name,
        position:
          employeeDefaultPosition.companyStructurePosition
            .companyStructureComponent.name
      };
    }
  }
}
