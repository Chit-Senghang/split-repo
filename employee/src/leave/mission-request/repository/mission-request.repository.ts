import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { MissionRequest } from '../entities/mission-request.entity';
import { IMissionRequestRepository } from './interface/mission-request.repository.interface';

@Injectable()
export class MissionRequestRepository
  extends RepositoryBase<MissionRequest>
  implements IMissionRequestRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(MissionRequest));
  }
}
