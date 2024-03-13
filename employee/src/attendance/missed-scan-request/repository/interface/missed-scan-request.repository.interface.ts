import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { MissedScanRequest } from '../../entities/missed-scan-request.entity';

export interface IMissedScanRequestRepository
  extends IRepositoryBase<MissedScanRequest> {}
