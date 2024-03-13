import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere
} from 'typeorm';
import { Employee } from '../../entity/employee.entity';
import { WorkShiftTypeEnum } from '../../../workshift-type/common/ts/enum/workshift-type.enum';
import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeAndUserTemplateDto } from '../../dto/employee-user.dto';

export interface IEmployeeRepository extends IRepositoryBase<Employee> {
  getEmployeeById(id: number, isValidate?: boolean): Promise<Employee>;

  getEmployeeByAccountNumberForImport(accountNumber: string): Promise<Employee>;

  getEmployeeOfCurrentUser(isValidate?: boolean): Promise<Employee>;

  getEmployeeByIdAndByDefaultPosition(id: number): Promise<Employee>;

  getEmployeeByUserId(userId: number, isValidate?: boolean): Promise<Employee>;

  getOneEmployeeByProvidedCondition(
    whereCondition: FindOptionsWhere<Employee>
  ): Promise<Employee>;

  getAllEmployeeByProvidedCondition(
    whereCondition: FindOptionsWhere<Employee>
  ): Promise<Employee[]>;

  findEmployeeByWorkShiftTypeAndId(
    workshiftType: WorkShiftTypeEnum,
    employeeId?: number
  ): Promise<Employee[]>;

  getAllEmployees(): Promise<Employee[]>;

  getEmployeeByOutletId(outletId: number): Promise<number>;

  findStartDateWithCurrentDate(): Promise<Employee[]>;

  findAllPostProbation(postProbationDate?: Date): Promise<Employee[]>;

  totalAllEmployee(): Promise<Employee[]>;

  getEmployeeWithUserTemplateByUserId(
    userId: number
  ): Promise<EmployeeAndUserTemplateDto>;

  getEmployeeByIdForQuery(id: number): Promise<Employee>;

  findOptionsSelect: FindOptionsSelect<Employee>;

  findOptionsRelations: FindOptionsRelations<Employee>;

  totalEmployeeWorkAnniversaryCount(): Promise<number>;

  totalEmployeeBirthdayCount(): Promise<number>;
}
