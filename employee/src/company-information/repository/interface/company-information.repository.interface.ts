import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { CompanyInformation } from '../../entities/company-information.entity';

export interface ICompanyInformationRepository
  extends IRepositoryBase<CompanyInformation> {}
