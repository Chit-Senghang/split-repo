import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { WorkflowTypeEnum } from '../../../shared-resources/common/enum/workflow-type.enum';
import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { ApprovalStatusEnum } from '../../common/ts/enum/approval-status.enum';
import { ApprovalStatus } from '../../entities/approval-status-tracking.entity';
import { ActionTypeEnum } from '../../common/ts/enum/action-type.enum';

export interface IApprovalStatusRepository
  extends IRepositoryBase<ApprovalStatus> {
  getOneForAdmin(
    entityId: number,
    status: ApprovalStatusEnum,
    entityType: WorkflowTypeEnum
  );
  getOne(id: number): Promise<any>;
  getOneForView(
    entityId: number,
    status: ApprovalStatusEnum,
    entityType: WorkflowTypeEnum
  ): Promise<any>;
  getOneForUpdate(id: number, employee: Employee): Promise<ApprovalStatus>;
  checkEmployeeIsEligibleInWorkflow(
    approvalStatus: ApprovalStatus,
    employee: Employee
  ): ActionTypeEnum;
}
