import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeEducation } from '../../entities/employee-education.entity';

export interface IEmployeeEducationRepository
  extends IRepositoryBase<EmployeeEducation> {}
