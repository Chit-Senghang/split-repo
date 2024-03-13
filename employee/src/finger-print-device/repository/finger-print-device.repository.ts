import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { FingerprintDevice } from '../entities/finger-print-device.entity';
import { IFingerPrintDeviceRepository } from './interface/finger-print-device.repository.interface';

@Injectable()
export class FingerPrintDeviceRepository
  extends RepositoryBase<FingerprintDevice>
  implements IFingerPrintDeviceRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(FingerprintDevice));
  }
}
