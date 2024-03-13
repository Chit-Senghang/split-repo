import { Inject, Injectable } from '@nestjs/common';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../../../shared-resources/export-file/common/enum/data-table-name.enum';
import { PaginationResponse } from '../../../shared-resources/ts/interface/response.interface';
import { Employee } from '../../../employee/entity/employee.entity';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { EmployeeWorkAnniversaryReportPaginationDto } from './dto/employee-work-anniversary-report.pagination.dto';
import { IEmployeeWorkAnniversaryReportRepository } from './repository/interface/employee-work-anniversary-report.interface';
import { EmployeeWorkAnniversaryReportRepository } from './repository/employee-work-anniversary-report.repository';

@Injectable()
export class EmployeeWorkAnniversaryReportService {
  constructor(
    @Inject(EmployeeWorkAnniversaryReportRepository)
    private readonly employeeWorkAnniversaryReportRepository: IEmployeeWorkAnniversaryReportRepository
  ) {}

  async exportFile(
    pagination: EmployeeWorkAnniversaryReportPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.getEmployeeWithStartDateInMonth(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.EMPLOYEE_WORK_ANNIVERSARY_REPORT,
      exportFileDto,
      data
    );
  }

  async getEmployeeWithStartDateInMonth(
    pagination: EmployeeWorkAnniversaryReportPaginationDto
  ): Promise<PaginationResponse<Employee>> {
    if (!pagination.month) {
      pagination.month = dayJs().get('month') + 1;
    } else {
      // minus 1 month because dayJs start from month 0 -> 11
      pagination.month = Number(pagination.month);
    }

    if (!pagination.year) {
      pagination.year = dayJs().get('year');
    }

    return await this.employeeWorkAnniversaryReportRepository.getEmployeeWithStartDateInMonth(
      pagination
    );
  }
}
