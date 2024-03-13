import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeVaccination } from '../../entities/employee-vaccination.entity';

export interface IEmployeeVaccinationRepository
  extends IRepositoryBase<EmployeeVaccination> {}
