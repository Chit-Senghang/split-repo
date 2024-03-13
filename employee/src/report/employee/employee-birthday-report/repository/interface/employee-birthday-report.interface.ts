import { Employee } from '../../../../../../../employee/src/employee/entity/employee.entity';
import { EmployeeBirthdayReportPaginationDto } from '../../dto/employee-birthday-report-pagination.dto';
import { PaginationResponse } from './../../../../../shared-resources/ts/interface/response.interface';

export interface IEmployeeBirthdayReportRepository {
  getEmployeeWithBirthdayInMonth(
    pagination: EmployeeBirthdayReportPaginationDto
  ): Promise<PaginationResponse<Employee>>;
}
