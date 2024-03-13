import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { CompanyStructureComponent } from '../entities/company-structure-component.entity';
import { ICompanyStructureComponentRepository } from './interface/company-structure-component.repository.interface';

@Injectable()
export class CompanyStructureComponentRepository
  extends RepositoryBase<CompanyStructureComponent>
  implements ICompanyStructureComponentRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(CompanyStructureComponent));
  }
}
