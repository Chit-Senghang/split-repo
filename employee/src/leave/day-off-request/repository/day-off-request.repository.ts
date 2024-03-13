import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { DayOffRequest } from '../entities/day-off-request.entity';
import { IDayOffRequestRepository } from './interface/day-off-request.repository.interface';

@Injectable()
export class DayOffRequestRepository
  extends RepositoryBase<DayOffRequest>
  implements IDayOffRequestRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(DayOffRequest));
  }
}
