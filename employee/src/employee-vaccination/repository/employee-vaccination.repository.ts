import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeVaccination } from '../entities/employee-vaccination.entity';
import { IEmployeeVaccinationRepository } from './interface/employee-vaccination.repository.interface';

@Injectable()
export class EmployeeVaccinationRepository
  extends RepositoryBase<EmployeeVaccination>
  implements IEmployeeVaccinationRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeVaccination));
  }
}
