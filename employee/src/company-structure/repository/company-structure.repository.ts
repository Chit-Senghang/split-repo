import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { CompanyStructure } from '../entities/company-structure.entity';
import { CompanyStructureTypeEnum } from '../common/ts/enum/structure-type.enum';
import { ICompanyStructureRepository } from './interface/company-structure.repository.interface';

@Injectable()
export class CompanyStructureRepository
  extends RepositoryBase<CompanyStructure>
  implements ICompanyStructureRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(CompanyStructure));
  }

  async getCompanyStructureByType(
    type: CompanyStructureTypeEnum
  ): Promise<CompanyStructure[]> {
    return await this.find({
      where: { companyStructureComponent: { type } },
      select: {
        id: true,
        companyStructureComponent: { id: true, type: true, name: true },
        children: {
          id: true,
          companyStructureComponent: { id: true, name: true }
        }
      },
      relations: {
        companyStructureComponent: true,
        children: { companyStructureComponent: true }
      }
    });
  }
}
