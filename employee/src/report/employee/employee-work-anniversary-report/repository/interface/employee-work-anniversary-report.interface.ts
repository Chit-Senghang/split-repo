import { EmployeeWorkAnniversaryReportPaginationDto } from '../../dto/employee-work-anniversary-report.pagination.dto';
import { PaginationResponse } from '../../../../../shared-resources/ts/interface/response.interface';
import { Employee } from './../../../../../employee/entity/employee.entity';

export interface IEmployeeWorkAnniversaryReportRepository {
  getEmployeeWithStartDateInMonth(
    pagination: EmployeeWorkAnniversaryReportPaginationDto
  ): Promise<PaginationResponse<Employee>>;
}
