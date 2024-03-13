import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeIdentifier } from '../entities/employee-identifier.entity';
import { IEmployeeIdentifierRepository } from './interface/employee-education.repository.interface';

@Injectable()
export class EmployeeIdentifierRepository
  extends RepositoryBase<EmployeeIdentifier>
  implements IEmployeeIdentifierRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeIdentifier));
  }
}
