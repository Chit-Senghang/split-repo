import { Inject, Injectable } from '@nestjs/common';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { Employee } from '../../../employee/entity/employee.entity';
import { DataTableNameEnum } from '../../../shared-resources/export-file/common/enum/data-table-name.enum';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../../shared-resources/export-file/common/function/export-data-files';
import { PaginationResponse } from '../../../shared-resources/ts/interface/response.interface';
import { EmployeePostProbationReportPaginationDto } from './dto/employee-post-probation-report-pagination.dto';
import { IEmployeePostProbationReportRepository } from './repository/interface/employee-post-probation-report.interface';
import { EmployeePostProbationReportRepository } from './repository/employee-post-probation-report.repository';

@Injectable()
export class EmployeePostProbationReportService {
  constructor(
    @Inject(EmployeePostProbationReportRepository)
    private readonly employeePostProbationReportRepository: IEmployeePostProbationReportRepository
  ) {}

  async exportFile(
    pagination: EmployeePostProbationReportPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } =
      await this.getAllEmployeeWithPostProbationInCurrentMonth(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.EMPLOYEE_POST_PROBATION_REPORT,
      exportFileDto,
      data
    );
  }

  async getAllEmployeeWithPostProbationInCurrentMonth(
    pagination: EmployeePostProbationReportPaginationDto
  ): Promise<PaginationResponse<Employee>> {
    if (!pagination.month) {
      pagination.month = dayJs().get('month');
    } else {
      pagination.month = Number(pagination.month) - 1; // minus 1 month because dayJs start from month 0 -> 11
    }

    if (!pagination.year) {
      pagination.year = dayJs().get('year');
    }

    return await this.employeePostProbationReportRepository.getAllEmployeeWithPostProbationInCurrentMonth(
      pagination
    );
  }
}
