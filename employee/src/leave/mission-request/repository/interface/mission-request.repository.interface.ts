import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { MissionRequest } from '../../entities/mission-request.entity';

export interface IMissionRequestRepository
  extends IRepositoryBase<MissionRequest> {}
