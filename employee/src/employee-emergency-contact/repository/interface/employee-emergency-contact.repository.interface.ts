import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeEmergencyContact } from '../../entities/employee-emergency-contact.entity';

export interface IEmployeeEmergencyContactRepository
  extends IRepositoryBase<EmployeeEmergencyContact> {}
