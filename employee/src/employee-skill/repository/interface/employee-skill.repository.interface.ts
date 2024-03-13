import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeSkill } from '../../entities/employee-skill.entity';

export interface IEmployeeSkillRepository
  extends IRepositoryBase<EmployeeSkill> {}
