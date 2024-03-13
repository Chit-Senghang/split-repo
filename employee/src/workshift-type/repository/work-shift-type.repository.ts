import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { WorkshiftType } from '../entities/workshift-type.entity';
import { IWorkShiftTypeRepository } from './interface/work-shift-type.repository.interface';

@Injectable()
export class WorkShiftTypeRepository
  extends RepositoryBase<WorkshiftType>
  implements IWorkShiftTypeRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(WorkshiftType));
  }
}
