import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeContact } from '../entities/employee-contact.entity';
import { IEmployeeContactRepository } from './interface/employee-contact.repository.interface';

@Injectable()
export class EmployeeContactRepository
  extends RepositoryBase<EmployeeContact>
  implements IEmployeeContactRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeContact));
  }
}
