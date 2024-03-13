import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { CompanyStructureTypeEnum } from '../../common/ts/enum/structure-type.enum';
import { CompanyStructure } from '../../entities/company-structure.entity';

export interface ICompanyStructureRepository
  extends IRepositoryBase<CompanyStructure> {
  getCompanyStructureByType(
    type: CompanyStructureTypeEnum
  ): Promise<CompanyStructure[]>;
}
