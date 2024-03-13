import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { CompanyInformation } from '../entities/company-information.entity';
import { ICompanyInformationRepository } from './interface/company-information.repository.interface';

@Injectable()
export class CompanyInformationRepository
  extends RepositoryBase<CompanyInformation>
  implements ICompanyInformationRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(CompanyInformation));
  }
}
