import { plainToClass } from 'class-transformer';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { MissionRequestDurationTypeEnEnum } from '../../../../../employee/src/leave/mission-request/enum/mission-request-duration-type.enum';
import { LeaveRequest } from '../../../../../employee/src/leave/leave-request/entities/leave-request.entity';
import { ResponseEmployeeDto } from '../../../../../employee/src/employee/dto/response-employee.dto';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { LeaveRequestDurationTypeEnEnum } from '../../../../../employee/src/leave/leave-request/enums/leave-request-duration-type.enum';
import { AttendanceReport } from '../entities/attendance-report.entity';
import { convertToCapitalizeCase } from '../../../shared-resources/utils/string-helper.utils';
import { AttendanceReportStatusEnum } from '../enum/attendance-report-status.enum';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { OvertimeRequest } from '../../overtime-request/entities/overtime-request.entity';

export class ResponseAttendanceReportDto {
  id: number;

  employee: ResponseEmployeeDto;

  scanType: number;

  date: string;

  checkIn: string;

  breakIn: string;

  breakOut: string;

  checkOut: string;

  lateCheckIn: number;

  breakInEarly: number;

  lateBreakOut: number;

  checkOutEarly: number;

  workingHour: string;

  otDuration: string;

  status: AttendanceReportStatusEnum;

  overtimeRequests: OvertimeRequest[];

  missionRequests: {
    id: number;
    durationType: MissionRequestDurationTypeEnEnum;
    fromDate: string;
    toDate: string;
    reason: string;
    status: StatusEnum;
  }[];

  leaveRequests: {
    id: number;
    durationType: LeaveRequestDurationTypeEnEnum;
    fromDate: string | Date;
    toDate: string | Date;
    reason: string;
    status: string;
    isSpecialLeave: boolean;
    leaveDuration: number;
    leaveTypeName: string;
    createdAt: string | Date;
  }[];

  dayOffRequest: {
    id: number;
    dayOffDate: string;
    status: StatusEnum;
  };

  leaveTitle: string;

  get getLeaveTitle(): string {
    this.leaveTitle = '';

    if (this.dayOffRequest) {
      this.leaveTitle = AttendanceReportStatusEnum.DAY_OFF;
    } else {
      if (this.leaveRequests.length) {
        this.leaveRequests.sort((a, b) => dayJs(b.createdAt).diff(a.createdAt));
        for (const leaveRequest of this.leaveRequests) {
          this.addSeparator();
          this.leaveTitle += `Leave: ${convertToCapitalizeCase(
            leaveRequest.durationType
          )}`;
        }
      }

      if (this.missionRequests.length) {
        this.missionRequests.sort((a, b) => dayJs(b.fromDate).diff(a.fromDate));
        for (const missionRequest of this.missionRequests) {
          this.addSeparator();
          this.leaveTitle += `Mission: ${convertToCapitalizeCase(
            missionRequest.durationType
          )}`;
        }
      }
    }

    return this.leaveTitle;
  }

  set setCheckIn(date: Date | undefined) {
    if (date) {
      this.checkIn = dayJs(date).format('HH:mm');
      return;
    }

    this.checkIn = null;
  }

  set setBreakIn(date: Date | undefined) {
    if (date) {
      this.breakIn = dayJs(date).format('HH:mm');
      return;
    }

    this.breakIn = null;
  }

  set setBreakOut(date: Date | undefined) {
    if (date) {
      this.breakOut = dayJs(date).format('HH:mm');
      return;
    }

    this.breakOut = null;
  }

  set setCheckOut(date: Date | undefined) {
    if (date) {
      this.checkOut = dayJs(date).format('HH:mm');
      return;
    }

    this.checkOut = null;
  }

  set setEmployee(employee: Employee) {
    this.employee = ResponseEmployeeDto.fromEntity(employee);
  }

  set setLeaveRequests(leaveRequests: LeaveRequest[]) {
    this.leaveRequests = leaveRequests.map((leaveRequest: LeaveRequest) => {
      return {
        ...leaveRequest,
        leaveTypeName: leaveRequest.leaveTypeVariation.leaveType.leaveTypeName
      };
    });
  }

  private addSeparator() {
    if (this.leaveTitle !== '') {
      this.leaveTitle += ', ';
    }
  }

  private invokeGetter(entity: AttendanceReport) {
    this.setLeaveRequests = entity.leaveRequests;
    this.leaveTitle = this.getLeaveTitle;
    this.setCheckIn = entity.checkIn;
    this.setBreakIn = entity.breakIn;
    this.setBreakOut = entity.breakOut;
    this.setCheckOut = entity.checkOut;
    return this;
  }

  static fromEntity(
    attendanceReportEntity: AttendanceReport
  ): ResponseAttendanceReportDto {
    const attendanceReportResponseDto = plainToClass(
      ResponseAttendanceReportDto,
      attendanceReportEntity
    );

    attendanceReportResponseDto.setEmployee = attendanceReportEntity.employee;

    return attendanceReportResponseDto.invokeGetter(attendanceReportEntity);
  }
}
