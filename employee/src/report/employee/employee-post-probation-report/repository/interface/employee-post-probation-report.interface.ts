import { EmployeePostProbationReportPaginationDto } from '../../dto/employee-post-probation-report-pagination.dto';
import { PaginationResponse } from './../../../../../shared-resources/ts/interface/response.interface';
import { Employee } from './../../../../../employee/entity/employee.entity';

export interface IEmployeePostProbationReportRepository {
  getAllEmployeeWithPostProbationInCurrentMonth(
    pagination: EmployeePostProbationReportPaginationDto
  ): Promise<PaginationResponse<Employee>>;
}
