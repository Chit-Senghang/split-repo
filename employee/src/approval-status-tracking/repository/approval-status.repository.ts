import { DataSource, FindOptionsWhere, In, Raw, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { WorkflowTypeEnum } from '../../shared-resources/common/enum/workflow-type.enum';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { ApprovalStatus } from '../entities/approval-status-tracking.entity';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { UtilityService } from '../../utility/utility.service';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { GrpcService } from '../../grpc/grpc.service';
import { ApprovalStatusEnum } from '../common/ts/enum/approval-status.enum';
import { Employee } from '../../employee/entity/employee.entity';
import { TypeEnum } from '../../request-approval-workflow/common/ts/enum/type.enum';
import { EmployeePosition } from '../../employee-position/entities/employee-position.entity';
import { ActionTypeEnum } from '../common/ts/enum/action-type.enum';
import { RequestApprovalWorkflowLevel } from '../../request-approval-workflow/entities/request-approval-workflow-level.entity';
import { IApprovalStatusRepository } from './interface/approval-status.repository.interface';

@Injectable()
export class ApprovalStatusRepository
  extends RepositoryBase<ApprovalStatus>
  implements IApprovalStatusRepository
{
  private readonly APPROVAL_STATUS: string = 'approval status';

  private readonly NOT_FOUND_MESSAGE = 'Resource approval status not found.';

  private readonly approvalStatusRepository: Repository<ApprovalStatus>;

  constructor(
    protected readonly dataSource: DataSource,
    private readonly utilityService: UtilityService,
    private readonly grpcService: GrpcService,
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository
  ) {
    super(dataSource.getRepository(ApprovalStatus));
    this.approvalStatusRepository = dataSource.getRepository(ApprovalStatus);
  }

  async getOneForView(
    entityId: number,
    status: ApprovalStatusEnum,
    entityType: WorkflowTypeEnum
  ) {
    const employee: Employee =
      await this.utilityService.getEmployeeByCurrentUser(false);

    if (!employee) {
      const approvalStatus: ApprovalStatus = await this.getOneForAdmin(
        entityId,
        status,
        entityType
      );

      if (!approvalStatus) {
        return null;
      }

      return this.mappingResponse(approvalStatus, employee);
    }

    const conditionForOwner = {
      entityId,
      requestWorkflowType: { requestType: entityType },
      status: status,
      employee: {
        id: employee.id,
        positions: { isMoved: false }
      }
    } as FindOptionsWhere<ApprovalStatus>;

    let approvalStatus: ApprovalStatus =
      await this.findOneWithWhereCondition(conditionForOwner);

    if (approvalStatus) {
      return this.mappingResponse(approvalStatus, employee);
    }

    const {
      employeeDepartmentIds,
      originalTeamIds,
      teamMpath,
      positionLevelIds
    } = this.utilityService.mappingEmployeeMpath(employee);

    const whereCondition = [
      {
        employee: {
          positions: {
            isMoved: false
          }
        },
        requestWorkflowType: {
          requestType: entityType
        },
        entityId: entityId,
        status,
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
            positionLevel: {
              id: In(positionLevelIds)
            }
          }
        }
      },
      {
        requestWorkflowType: {
          requestType: entityType
        },
        entityId: entityId,
        status,
        employee: {
          positions: {
            isMoved: false,
            mpath:
              this.utilityService.generateScriptToCheckTeamMpath(teamMpath),
            companyStructureDepartment: {
              id: In(employeeDepartmentIds)
            }
          }
        }
      }
    ] as FindOptionsWhere<ApprovalStatus>;
    approvalStatus = await this.findOneWithWhereCondition(whereCondition);

    if (!approvalStatus) {
      return null;
    }

    return this.mappingResponse(approvalStatus, employee);
  }

  async getOneForUpdate(
    id: number,
    employee: Employee
  ): Promise<ApprovalStatus> {
    const {
      employeeDepartmentIds,
      originalTeamIds,
      positionLevelIds,
      teamMpath
    } = this.utilityService.mappingEmployeeMpath(employee);

    const typeCondition = In([
      TypeEnum.FIRST_APPROVALS,
      TypeEnum.SECOND_APPROVALS,
      TypeEnum.ACKNOWLEDGERS
    ]);

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
              id: In([...employeeDepartmentIds, null])
            },
            companyStructureTeam: {
              id: In([...originalTeamIds, null])
            },
            type: typeCondition,
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
            type: typeCondition,
            positionLevel: {
              id: In(positionLevelIds)
            }
          }
        }
      };

    const whereCondition = [
      approvalStatusCrossDepartmentCondition,
      approvalStatusSameDepartmentCondition
    ] as FindOptionsWhere<ApprovalStatus>;

    return await this.findOneWithWhereCondition(whereCondition);
  }

  async getOneForAdmin(
    entityId: number,
    status: ApprovalStatusEnum,
    entityType: WorkflowTypeEnum
  ): Promise<ApprovalStatus> {
    const whereCondition = {
      entityId,
      status,
      requestWorkflowType: { requestType: entityType },
      employee: { positions: { isMoved: false } }
    } as FindOptionsWhere<ApprovalStatus>;
    return await this.findOneWithWhereCondition(whereCondition);
  }

  async getOne(id: number) {
    const whereCondition = {
      id,
      employee: { positions: { isMoved: false } }
    } as FindOptionsWhere<ApprovalStatus>;
    const employee: Employee =
      await this.employeeRepository.getEmployeeOfCurrentUser(false);

    const approvalStatus = await this.findOneWithWhereCondition(whereCondition);
    if (approvalStatus) {
      return this.mappingResponse(approvalStatus, employee);
    }
  }

  public checkEmployeeIsEligibleInWorkflow(
    approvalStatus: ApprovalStatus,
    employee: Employee
  ): ActionTypeEnum {
    const approverIds = [
      approvalStatus.firstApprovalUserId,
      approvalStatus.secondApprovalUserId,
      approvalStatus.acknowledgeUserId,
      approvalStatus.createdBy
    ];

    let actionButton: ActionTypeEnum;

    let hasNoPermission = false;

    // check admin or record owner
    if (!employee || employee.id === approvalStatus.employee.id) {
      hasNoPermission = true;
      //check approver already approved
    } else if (approverIds.includes(employee?.userId)) {
      hasNoPermission = true;
    } else if (approvalStatus.status !== ApprovalStatusEnum.PENDING) {
      hasNoPermission = true;
    }

    if (hasNoPermission) {
      actionButton = ActionTypeEnum.NO;
    } else {
      actionButton = this.convertActionButton(
        this.checkActionEmployee(approvalStatus)
      );
    }

    return actionButton;
  }

  // =========================== [Private block function] ===========================
  private async findOneWithWhereCondition(
    whereCondition: FindOptionsWhere<ApprovalStatus>
  ): Promise<ApprovalStatus> {
    const approvalStatus: ApprovalStatus | null =
      await this.approvalStatusRepository.findOne({
        where: whereCondition,
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

    return approvalStatus;
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
      employeeInfo: approvalStatus?.employeeInfo
        ? JSON.parse(approvalStatus.employeeInfo)
        : null,
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
      actionType: this.checkEmployeeIsEligibleInWorkflow(
        approvalStatus,
        employee
      ),
      approverType: this.checkActionEmployee(approvalStatus)
    };
  }

  private async mappingApproversResponse(approvalStatus: ApprovalStatus) {
    return {
      createdBy: await this.mappingUserResponse(approvalStatus.createdBy),
      firstApprovalUser:
        approvalStatus.firstApprovalUserId &&
        (await this.mappingUserResponse(approvalStatus.firstApprovalUserId)),
      secondApprovalUser:
        approvalStatus.secondApprovalUserId &&
        (await this.mappingUserResponse(approvalStatus.secondApprovalUserId)),
      acknowledgeUser:
        approvalStatus.acknowledgeUserId &&
        (await this.mappingUserResponse(approvalStatus.acknowledgeUserId))
    };
  }

  private async mappingUserResponse(id: number) {
    const user = await this.grpcService.getUserById(id);
    if (!user) {
      throw new ResourceNotFoundException('user', id);
    }

    let employee: Employee;
    if (user.isSelfService) {
      employee = await this.employeeRepository.getEmployeeByUserId(user.id);
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
    }
  }

  private positionsMatchedWithWorkflow(
    requestApprovalWorkflowLevels: RequestApprovalWorkflowLevel[]
  ): TypeEnum[] {
    return requestApprovalWorkflowLevels.map(
      (requestApprovalWorkflowLevel) => requestApprovalWorkflowLevel.type
    );
  }

  private convertActionButton(type: TypeEnum) {
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
}
