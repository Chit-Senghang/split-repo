import { Inject, Injectable } from '@nestjs/common';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { Employee } from '../../../employee/entity/employee.entity';
import { exportDataFiles } from '../../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../../../shared-resources/export-file/common/enum/data-table-name.enum';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { PaginationResponse } from '../../../shared-resources/ts/interface/response.interface';
import { EmployeeBirthdayReportRepository } from './repository/employee-birthday-report.repository';
import { IEmployeeBirthdayReportRepository } from './repository/interface/employee-birthday-report.interface';
import { EmployeeBirthdayReportPaginationDto } from './dto/employee-birthday-report-pagination.dto';

@Injectable()
export class EmployeeBirthdayReportService {
  constructor(
    @Inject(EmployeeBirthdayReportRepository)
    private readonly employeeBirthdayReportRepository: IEmployeeBirthdayReportRepository
  ) {}

  async exportFile(
    pagination: EmployeeBirthdayReportPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.getEmployeeWithBirthdayInMonth(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.EMPLOYEE_BIRTHDAY_REPORT,
      exportFileDto,
      data
    );
  }

  async getEmployeeWithBirthdayInMonth(
    pagination: EmployeeBirthdayReportPaginationDto
  ): Promise<PaginationResponse<Employee>> {
    if (!pagination.month) {
      pagination.month = dayJs().get('month') + 1;
    } else {
      pagination.month = Number(pagination.month); // minus 1 month because dayJs start from month 0 -> 11
    }
    return await this.employeeBirthdayReportRepository.getEmployeeWithBirthdayInMonth(
      pagination
    );
  }
}
