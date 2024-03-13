import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeTraining } from '../../entities/employee-training.entity';

export interface IEmployeeTrainingRepository
  extends IRepositoryBase<EmployeeTraining> {}
