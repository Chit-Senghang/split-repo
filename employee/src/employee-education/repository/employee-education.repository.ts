import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeEducation } from '../entities/employee-education.entity';
import { IEmployeeEducationRepository } from './interface/employee-education.repository.interface';

@Injectable()
export class EmployeeEducationRepository
  extends RepositoryBase<EmployeeEducation>
  implements IEmployeeEducationRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeEducation));
  }
}
