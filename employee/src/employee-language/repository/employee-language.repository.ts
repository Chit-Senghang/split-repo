import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeLanguage } from '../entities/employee-language.entity';
import { IEmployeeLanguageRepository } from './interface/employee-language.repository.interface';

@Injectable()
export class EmployeeLanguageRepository
  extends RepositoryBase<EmployeeLanguage>
  implements IEmployeeLanguageRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeLanguage));
  }
}
