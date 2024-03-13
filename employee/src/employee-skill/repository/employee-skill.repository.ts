import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeSkill } from '../entities/employee-skill.entity';
import { IEmployeeSkillRepository } from './interface/employee-skill.repository.interface';

@Injectable()
export class EmployeeSkillRepository
  extends RepositoryBase<EmployeeSkill>
  implements IEmployeeSkillRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeSkill));
  }
}
