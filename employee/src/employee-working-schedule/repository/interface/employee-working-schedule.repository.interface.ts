import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeWorkingSchedule } from '../../entities/employee-working-schedule.entity';

export interface IEmployeeWorkingScheduleRepository
  extends IRepositoryBase<EmployeeWorkingSchedule> {}
