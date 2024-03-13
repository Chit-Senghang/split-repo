import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeTraining } from '../entities/employee-training.entity';
import { IEmployeeTrainingRepository } from './interface/employee-training.repository.interface';

@Injectable()
export class EmployeeTrainingRepository
  extends RepositoryBase<EmployeeTraining>
  implements IEmployeeTrainingRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeTraining));
  }
}
