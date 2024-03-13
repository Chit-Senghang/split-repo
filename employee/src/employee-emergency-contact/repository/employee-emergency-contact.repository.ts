import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeEmergencyContact } from '../entities/employee-emergency-contact.entity';
import { IEmployeeEmergencyContactRepository } from './interface/employee-emergency-contact.repository.interface';

@Injectable()
export class EmployeeEmergencyContactRepository
  extends RepositoryBase<EmployeeEmergencyContact>
  implements IEmployeeEmergencyContactRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeEmergencyContact));
  }
}
