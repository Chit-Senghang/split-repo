import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { LeaveType } from '../../entities/leave-type.entity';

export interface ILeaveRequestTypeRepository
  extends IRepositoryBase<LeaveType> {}
