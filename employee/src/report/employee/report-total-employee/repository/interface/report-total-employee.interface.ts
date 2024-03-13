import { Employee } from '../../../../../../../employee/src/employee/entity/employee.entity';

export interface IReportTotalEmployeeRepository {
  getAllPostProbation(): Promise<Employee[]>;

  getAllEmployees(): Promise<Employee[]>;
}
