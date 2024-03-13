import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeLanguage } from '../../entities/employee-language.entity';

export interface IEmployeeLanguageRepository
  extends IRepositoryBase<EmployeeLanguage> {}
