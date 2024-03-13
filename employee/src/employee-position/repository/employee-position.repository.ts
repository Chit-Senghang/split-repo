import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeePosition } from '../entities/employee-position.entity';
import { IEmployeePositionRepository } from './interface/employee-position.repository.interface';

@Injectable()
export class EmployeePositionRepository
  extends RepositoryBase<EmployeePosition>
  implements IEmployeePositionRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeePosition));
  }
}
