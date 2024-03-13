import { Inject, Injectable } from '@nestjs/common';
import { FindOperator, Raw } from 'typeorm';
import { AttendanceReport } from '../../../../../employee/src/attendance/attendance-report/entities/attendance-report.entity';
import { getCurrentDate } from '../../../shared-resources/common/utils/date-utils';
import { DEFAULT_MONTH_FORMAT } from '../../../shared-resources/common/dto/default-date-format';
import { getCurrentUserFromContext } from '../../../shared-resources/utils/get-user-from-current-context.common';
import { ReportEnum } from '../../enums/report.enum';
import { AttendanceReminderReportDto } from './dto/attendance-reminder-report';
import { AttendanceReminderReportRepository } from './repository/attendance-reminder-report.repository';
import { IAttendanceReminderReportRepository } from './repository/interface/attendance-reminder-report.repository.interface';

@Injectable()
export class AttendanceReminderReportService {
  constructor(
    @Inject(AttendanceReminderReportRepository)
    private readonly attendanceReminderReportRepository: IAttendanceReminderReportRepository
  ) {}

  private calculateTotalLateInMinuteCount = (
    attendanceReport: AttendanceReport[]
  ): number => {
    const totalSum: number = attendanceReport.reduce(
      (accumulator: number, item: AttendanceReport) => {
        return (
          accumulator +
          item.lateCheckIn +
          item.lateBreakOut +
          item.checkOutEarly
        );
      },
      0
    );

    return totalSum;
  };

  async getAttendanceReminderReport(): Promise<AttendanceReminderReportDto> {
    const currentUserId: number = getCurrentUserFromContext();
    const currentMonth: string = getCurrentDate().format(DEFAULT_MONTH_FORMAT);
    const checkBaseCurrentMonthCondition: FindOperator<Date> = Raw(
      (date) =>
        `TO_CHAR(${date}, '${DEFAULT_MONTH_FORMAT}') = '${currentMonth}'`
    );

    const totalMissedScanCount: number =
      await this.attendanceReminderReportRepository.getMissedScanRequestCount(
        currentUserId,
        checkBaseCurrentMonthCondition
      );

    const attendanceReport: AttendanceReport[] =
      await this.attendanceReminderReportRepository.getAttendanceReport(
        currentUserId,
        checkBaseCurrentMonthCondition
      );

    const totalLateInMinuteCount: number =
      this.calculateTotalLateInMinuteCount(attendanceReport);

    const totalAbsentCount: number =
      await this.attendanceReminderReportRepository.getAttendanceReportCount(
        currentUserId,
        checkBaseCurrentMonthCondition
      );

    const attendanceReminderReport = new AttendanceReminderReportDto(
      ReportEnum.REPORT_ATTENDANCE_REMINDER,
      totalMissedScanCount,
      totalAbsentCount,
      totalLateInMinuteCount
    );
    return attendanceReminderReport;
  }
}
