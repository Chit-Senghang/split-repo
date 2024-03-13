import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { LeaveType } from '../../entities/leave-type.entity';

export interface ILeaveTypeRepository extends IRepositoryBase<LeaveType> {
  getLeaveTypeById(id: number): Promise<LeaveType>;
}
