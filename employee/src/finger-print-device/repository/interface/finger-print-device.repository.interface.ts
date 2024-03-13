import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { FingerprintDevice } from '../../entities/finger-print-device.entity';

export interface IFingerPrintDeviceRepository
  extends IRepositoryBase<FingerprintDevice> {}
