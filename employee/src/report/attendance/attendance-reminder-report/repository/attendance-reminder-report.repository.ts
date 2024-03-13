import { Inject } from '@nestjs/common';
import { FindOperator, In } from 'typeorm';
import { MissedScanRequestRepository } from '../../../../../../employee/src/attendance/missed-scan-request/repository/missed-scan-request.repository';
import { IMissedScanRequestRepository } from '../../../../../../employee/src/attendance/missed-scan-request/repository/interface/missed-scan-request.repository.interface';
import { AttendanceReport } from '../../../../../../employee/src/attendance/attendance-report/entities/attendance-report.entity';
import { AttendanceReportRepository } from '../../../../../../employee/src/attendance/attendance-report/repository/attendance-report.repository';
import { IAttendanceReportRepository } from '../../../../../../employee/src/attendance/attendance-report/repository/interface/attendance-report.repository.interface';
import { AttendanceReportStatusEnum } from '../../../../../../employee/src/attendance/attendance-report/enum/attendance-report-status.enum';
import { EmployeeActiveStatusEnum } from '../../../../../../employee/src/employee/enum/employee-status.enum';
import { MissedScanRequest } from '../../../../../../employee/src/attendance/missed-scan-request/entities/missed-scan-request.entity';
import { StatusEnum } from '../../../../shared-resources/common/enums/status.enum';
import { IAttendanceReminderReportRepository } from './interface/attendance-reminder-report.repository.interface';

export class AttendanceReminderReportRepository
  implements IAttendanceReminderReportRepository
{
  constructor(
    @Inject(MissedScanRequestRepository)
    private readonly missedScanRequestRepo: IMissedScanRequestRepository,
    @Inject(AttendanceReportRepository)
    private readonly attendanceReportRepository: IAttendanceReportRepository
  ) {}

  async getAttendanceReportCount(
    currentUserId: number,
    checkBaseCurrentMonthCondition: FindOperator<Date>
  ): Promise<number> {
    const attendanceReport: [AttendanceReport[], number] =
      await this.attendanceReportRepository.findAndCount({
        where: {
          date: checkBaseCurrentMonthCondition,
          status: AttendanceReportStatusEnum.ABSENT,
          employee: {
            userId: currentUserId,
            status: In(Object.values(EmployeeActiveStatusEnum))
          }
        }
      });
    return attendanceReport[1] || 0;
  }

  async getAttendanceReport(
    currentUserId: number,
    checkBaseCurrentMonthCondition: FindOperator<Date>
  ): Promise<AttendanceReport[]> {
    return await this.attendanceReportRepository.find({
      where: {
        date: checkBaseCurrentMonthCondition,
        employee: {
          userId: currentUserId,
          status: In(Object.values(EmployeeActiveStatusEnum))
        }
      }
    });
  }

  async getMissedScanRequestCount(
    currentUserId: number,
    checkBaseCurrentMonthCondition: FindOperator<Date>
  ): Promise<number> {
    const missedScanRequest: [MissedScanRequest[], number] =
      await this.missedScanRequestRepo.findAndCount({
        where: {
          status: StatusEnum.ACTIVE,
          requestDate: checkBaseCurrentMonthCondition,
          employee: {
            userId: currentUserId,
            status: In(Object.values(EmployeeActiveStatusEnum))
          }
        }
      });
    return missedScanRequest[1] || 0;
  }
}
