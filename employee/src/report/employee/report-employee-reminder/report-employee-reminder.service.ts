import { Inject, Injectable } from '@nestjs/common';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { ReportEnum } from '../../enums/report.enum';
import { PublicHoliday } from './../../../attendance/public-holiday/entities/public-holiday.entity';
import { customValidateDate } from './../../../shared-resources/utils/validate-date-format';
import { PaginationReportEmployeeReminder } from './dto/pagination-report-employee-reminder.dto';
import { ResponseReportEmployeeReminderDto } from './dto/response-report-employee-reminder.dto';
import { ReportEmployeeReminderRepository } from './repository/report-employee-reminder.repository';
import { IReportEmployeeReminderRepository } from './repository/interface/report-employee-reminder.interface';

@Injectable()
export class ReportEmployeeReminderService {
  constructor(
    @Inject(ReportEmployeeReminderRepository)
    private readonly reportEmployeeReminderRepository: IReportEmployeeReminderRepository
  ) {}

  async reportEmployeeReminder(
    pagination: PaginationReportEmployeeReminder
  ): Promise<ResponseReportEmployeeReminderDto> {
    if (pagination.date) {
      customValidateDate(pagination.date);
    }
    const date: Date = pagination.date
      ? dayJs(pagination.date).utc(true).toDate()
      : null;
    const totalPublicHolidayCount: PublicHoliday[] =
      await this.reportEmployeeReminderRepository.getTotalPublicHolidayCount(
        date
      );
    const employees: Employee[] =
      await this.reportEmployeeReminderRepository.getEmployeePassPostProbation(
        date
      );
    const totalEmployeeBirthdayCount: number =
      await this.reportEmployeeReminderRepository.getTotalEmployeeBirthdayCount();
    const countAnniversaries: number =
      await this.reportEmployeeReminderRepository.getTotalEmployeeWorkAnniversaryCount();
    return {
      reportId: ReportEnum.REPORT_EMPLOYEE_REMINDER,
      totalEmployeeBirthdayCount: totalEmployeeBirthdayCount,
      totalEmployeePostProbationCount: employees?.length,
      totalEmployeeWorkAnniversaryCount: countAnniversaries,
      totalPublicHolidayCount: totalPublicHolidayCount?.length
    };
  }
}
