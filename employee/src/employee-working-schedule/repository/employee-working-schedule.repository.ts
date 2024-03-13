import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeWorkingSchedule } from '../entities/employee-working-schedule.entity';
import { IEmployeeWorkingScheduleRepository } from './interface/employee-working-schedule.repository.interface';

@Injectable()
export class EmployeeWorkingScheduleRepository
  extends RepositoryBase<EmployeeWorkingSchedule>
  implements IEmployeeWorkingScheduleRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeWorkingSchedule));
  }
}
