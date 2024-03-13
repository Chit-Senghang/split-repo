import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { DayOffRequest } from '../../entities/day-off-request.entity';

export interface IDayOffRequestRepository
  extends IRepositoryBase<DayOffRequest> {}
