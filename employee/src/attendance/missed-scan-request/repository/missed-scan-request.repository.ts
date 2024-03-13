import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { IMissedScanRequestRepository } from './interface/missed-scan-request.repository.interface';
import { MissedScanRequest } from './../entities/missed-scan-request.entity';

@Injectable()
export class MissedScanRequestRepository
  extends RepositoryBase<MissedScanRequest>
  implements IMissedScanRequestRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(MissedScanRequest));
  }
}
