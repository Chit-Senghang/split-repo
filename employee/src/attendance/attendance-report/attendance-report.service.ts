//#region //* Import Library
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import {
  Between,
  FindOperator,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Raw
} from 'typeorm';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { OvertimeTypeEnum } from '../../shared-resources/common/enums/overtime-type.enum';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import { Employee } from '../../employee/entity/employee.entity';
import { AttendanceRecord } from '../attendance-record/entities/attendance-record.entity';
import { PublicHoliday } from '../public-holiday/entities/public-holiday.entity';
import { EmployeeWorkingSchedule } from '../../employee-working-schedule/entities/employee-working-schedule.entity';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import {
  dayJs,
  formatMinuteToHHmm,
  isSaturday,
  isSunday,
  getCurrentDateWithFormat,
  getStartOfDate,
  getEndOfDate
} from '../../shared-resources/common/utils/date-utils';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { checkIsValidYearFormat } from '../../shared-resources/utils/validate-date-format';
import { GrpcService } from '../../grpc/grpc.service';
import { WorkShiftTypeEnum } from '../../workshift-type/common/ts/enum/workshift-type.enum';
import { WorkingShift } from '../../workshift-type/entities/working-shift.entity';
import { ScanTypeEnum } from '../../workshift-type/common/ts/enum/status-type.enum';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { DayOffRequestRepository } from '../../leave/day-off-request/repository/day-off-request.repository';
import { IDayOffRequestRepository } from '../../leave/day-off-request/repository/interface/day-off-request.repository.interface';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { IEmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/interface/employee-working-schedule.repository.interface';
import { PublicHolidayRepository } from '../public-holiday/repository/public-holiday.repository';
import { IPublicHolidayRepository } from '../public-holiday/repository/interface/public-holiday.repository.interface';
import { LeaveRequestRepository } from '../../leave/leave-request/repository/leave-request.repository';
import { MissionRequestRepository } from '../../leave/mission-request/repository/mission-request.repository';
import { IMissionRequestRepository } from '../../leave/mission-request/repository/interface/mission-request.repository.interface';
import { ILeaveRequestRepository } from '../../leave/leave-request/repository/interface/leave-request-repository.interface';
import { AttendanceRecordRepository } from '../attendance-record/repository/attendance-record.repository';
import { OvertimeRequestRepository } from '../overtime-request/repository/overtime-request.repository';
import { IOvertimeRequestRepository } from '../overtime-request/repository/interface/overtime-request.repository.interface';
import { IAttendanceRecordRepository } from '../attendance-record/repository/interface/attendance-record.interface';
import { LeaveRequestDurationTypeEnEnum } from '../../leave/leave-request/enums/leave-request-duration-type.enum';
import { MissionRequestDurationTypeEnEnum } from '../../leave/mission-request/enum/mission-request-duration-type.enum';
import { LeaveRequest } from '../../leave/leave-request/entities/leave-request.entity';
import { MissionRequest } from '../../leave/mission-request/entities/mission-request.entity';
import { EmployeeActiveStatusEnum } from '../../employee/enum/employee-status.enum';
import { UtilityService } from '../../utility/utility.service';
import { AttendanceReport } from './entities/attendance-report.entity';
import { PaginationQueryAttendanceReportDto } from './dto/paginate.dto';
import { AttendanceReportRepository } from './repository/attendance-report.repository';
import { IAttendanceReportRepository } from './repository/interface/attendance-report.repository.interface';
import { AttendanceReportStatusEnum } from './enum/attendance-report-status.enum';
import { ResponseAttendanceReportDto } from './dto/attendance-report-response.dto';

@Injectable()
export class AttendanceReportService {
  //#region //* Constructor
  constructor(
    @Inject(AttendanceRecordRepository)
    private readonly attendanceRecordRepo: IAttendanceRecordRepository,
    @Inject(AttendanceReportRepository)
    private readonly attendanceReportRepo: IAttendanceReportRepository,
    @Inject(DayOffRequestRepository)
    private readonly dayOffRequestRepo: IDayOffRequestRepository,
    @Inject(EmployeeWorkingScheduleRepository)
    private readonly employeeWorkingScheduleRepo: IEmployeeWorkingScheduleRepository,
    @Inject(OvertimeRequestRepository)
    private readonly overtimeRequestRepo: IOvertimeRequestRepository,
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository,
    @Inject(LeaveRequestRepository)
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    @Inject(MissionRequestRepository)
    private readonly missionRequestRepo: IMissionRequestRepository,
    private readonly grpcService: GrpcService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly utilityService: UtilityService
  ) {}
  //#endregion

  //#region //* Public Methods
  async exportAttendanceFile(
    pagination: PaginationQueryAttendanceReportDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.ATTENDANCE_REPORT,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationQueryAttendanceReportDto) {
    if (pagination.fromDate || pagination.toDate) {
      if (!(pagination.toDate && pagination.fromDate)) {
        throw new BadRequestException(
          `You need to add query fromDate and toDate format(${DEFAULT_DATE_FORMAT})`
        );
      }
    }

    let dateQueryCondition: FindOperator<Date> | undefined;
    if (pagination.fromDate && pagination.toDate) {
      checkIsValidYearFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
      checkIsValidYearFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
      dateQueryCondition = Between(
        getStartOfDate(pagination.fromDate),
        getStartOfDate(pagination.toDate)
      );
    } else {
      const currentDate = getCurrentDateWithFormat();
      dateQueryCondition = Between(
        dayJs(currentDate).startOf('month').format(DEFAULT_DATE_FORMAT),
        dayJs(currentDate).endOf('month').format(DEFAULT_DATE_FORMAT)
      ) as any;
    }

    let fullNameQueryCondition: FindOperator<string> | undefined;
    if (pagination.displayFullNameEn) {
      fullNameQueryCondition = ILike(`%${pagination.displayFullNameEn}%`);
    }

    const employeeIds = await this.utilityService.getCurrentUserMpath(null);

    return await this.attendanceReportRepo.findAllWithPagination(
      pagination,
      [],
      {
        where: {
          employee: {
            id: pagination.employeeId ?? In(employeeIds),
            status: In(Object.values(EmployeeActiveStatusEnum)),
            displayFullNameEn: fullNameQueryCondition,
            positions: {
              companyStructureLocation: {
                id: pagination.locationId
              },
              companyStructureOutlet: {
                id: pagination.outletId
              },
              companyStructureDepartment: {
                id: pagination.departmentId
              },
              companyStructureTeam: {
                id: pagination.teamId
              },
              companyStructurePosition: { id: pagination.positionId }
            }
          },
          date: dateQueryCondition,
          status: pagination.status
        },
        relation: {
          employee: {
            positions: {
              companyStructureCompany: {
                companyStructureComponent: true
              },
              companyStructureLocation: {
                companyStructureComponent: true
              },
              companyStructureOutlet: {
                companyStructureComponent: true
              },
              companyStructureDepartment: {
                companyStructureComponent: true
              },
              companyStructureTeam: {
                companyStructureComponent: true
              },
              companyStructurePosition: {
                companyStructureComponent: true,
                positionLevelId: true
              }
            }
          },
          leaveRequests: {
            leaveTypeVariation: {
              leaveType: true
            }
          },
          missionRequests: true,
          overtimeRequests: true,
          dayOffRequest: true
        },
        select: {
          employee: {
            id: true,
            firstNameEn: true,
            lastNameEn: true,
            displayFullNameEn: true,
            accountNo: true,
            positions: {
              id: true,
              isDefaultPosition: true,
              companyStructureCompany: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              },
              companyStructureLocation: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              },
              companyStructureOutlet: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              },
              companyStructureDepartment: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              },
              companyStructureTeam: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              },
              companyStructurePosition: {
                id: true,
                companyStructureComponent: { id: true, name: true }
              }
            },
            leaveRequest: {
              id: true
            }
          }
        },
        mapFunction: (attendanceReport: AttendanceReport) =>
          ResponseAttendanceReportDto.fromEntity(attendanceReport)
      }
    );
  }

  async createMonthlyReport(date: string) {
    const days = dayJs(date).daysInMonth();
    const month = dayJs(date).format('MM');
    const year = dayJs(date).year();

    Logger.log(`START: generate attendance report full month of ${date}.`);
    for (let i = 1; i <= days; i++) {
      Logger.log(`START: ${year}/${month}/${i}.`);
      await this.generateAttendanceReportByDate(`${year}/${month}/${i}`);
      Logger.log(`END: ${year}/${month}/${i}.`);
    }
    Logger.log(`END: generate attendance report full month of ${date}.`);
  }

  /**
   * Generates an attendance report for all normal and roster employees.
   *
   * @param date The date for which to generate the report. If `undefined`, the current date will be used.
   * @param employeeId The employee ID for which to generate the report. If `undefined`, the report will be generated for all employees.
   * @returns A promise that resolves when the report has been generated.
   */
  async generateAttendanceReportByDate(
    date?: string | Date,
    employeeId?: number
  ): Promise<void> {
    const reportDate: Date = getStartOfDate(date ?? dayJs().toDate());

    const normalEmployees: Employee[] =
      await this.employeeRepo.findEmployeeByWorkShiftTypeAndId(
        WorkShiftTypeEnum.NORMAL,
        employeeId
      );

    const rosterEmployees: Employee[] =
      await this.employeeRepo.findEmployeeByWorkShiftTypeAndId(
        WorkShiftTypeEnum.ROSTER,
        employeeId
      );

    // Attendance report need to re-calculate
    const existingReports = await this.attendanceReportRepo.find({
      where: { employee: { id: employeeId }, date: reportDate }
    });

    await this.employeeRepo.runTransaction(
      async (queryRunner: QueryRunner): Promise<void> => {
        await this.runAttendanceReportTransaction(
          queryRunner,
          existingReports,
          normalEmployees,
          rosterEmployees,
          reportDate
        );
      }
    );
  }

  async recalculateAttendanceReportForBackDateRequest(
    employeeId: number,
    requestDate: string | Date,
    requestToDate?: string | Date
  ): Promise<void> {
    const endOfPrevDay = getEndOfDate(dayJs().add(-1, 'day').toDate());
    if (dayJs(requestDate).isBefore(endOfPrevDay)) {
      if (requestToDate) {
        const durationBetweenFromAndToDate: number =
          dayJs(requestToDate).diff(requestDate, 'day') + 1;

        const durationBetweenFromAndPrevDate: number =
          dayJs(endOfPrevDay).diff(requestDate, 'day') + 1;

        const recalculateDuration =
          durationBetweenFromAndToDate < durationBetweenFromAndPrevDate
            ? durationBetweenFromAndToDate
            : durationBetweenFromAndPrevDate;

        // Recalculate for all attendance in past on request date range
        for (let i = 0; i < recalculateDuration; i++) {
          const recalculateDate = dayJs(requestDate).add(i, 'day').toDate();

          const isAnyAttendanceReport =
            await this.isAnyAttendanceReport(recalculateDate);
          if (isAnyAttendanceReport) {
            Logger.log(`recalculateDate ${recalculateDate}`);
            await this.generateAttendanceReportByDate(
              recalculateDate,
              employeeId
            );
          }
        }
      } else {
        const isAnyAttendanceReport =
          await this.isAnyAttendanceReport(requestDate);

        if (isAnyAttendanceReport) {
          await this.generateAttendanceReportByDate(requestDate, employeeId);
        }
      }
    }
  }

  async temporaryReport(paginate: PaginationQueryAttendanceReportDto) {
    // TODO: Generate temporary attendance report
    return await this.findAll(paginate);
  }
  //#endregion

  //#region //* Private Methods
  private async isAnyAttendanceReport(date: Date | string): Promise<boolean> {
    return this.attendanceReportRepo.exist({
      where: {
        date: dayJs(date).startOf('day').toDate()
      }
    });
  }

  private async findEmployeeWorkingSchedule(
    employee: Employee,
    reportDate: Date
  ): Promise<EmployeeWorkingSchedule | null> {
    return await this.employeeWorkingScheduleRepo.findOne({
      where: {
        employeeId: { id: employee.id },
        scheduleDate: Between(reportDate, getEndOfDate(reportDate))
      },
      relations: {
        employeeId: true
      }
    });
  }

  private async findActiveMissionRequest(
    attendanceReport: AttendanceReport
  ): Promise<AttendanceReport> {
    attendanceReport.missionRequests = await this.missionRequestRepo.find({
      where: {
        status: StatusEnum.ACTIVE,
        employee: { id: attendanceReport.employee.id },
        fromDate: Raw(
          (alias) =>
            `TO_CHAR(${alias}, 'YYYY-MM-DD') <= '${dayJs(
              attendanceReport.date
            ).format('YYYY-MM-DD')}'`
        ),
        toDate: Raw(
          (alias) =>
            `TO_CHAR(${alias}, 'YYYY-MM-DD') >= '${dayJs(
              attendanceReport.date
            ).format('YYYY-MM-DD')}'`
        )
      },
      relations: {
        employee: true
      },
      order: {
        fromDate: 'ASC'
      }
    });

    return attendanceReport;
  }

  private getDurationInMinute(
    start: Date | string,
    end: Date | string
  ): number {
    return dayJs(dayJs(end).startOf('minute')).diff(
      dayJs(start).startOf('minute'),
      'minute'
    );
  }

  private findCheckInStart(date: Date, time: Date): Date {
    return dayJs(this.combineDateAndTime(date, time)).startOf('day').toDate();
  }

  private async findCheckInEnd(date: Date, time: Date): Promise<Date> {
    const allowBeforeAndAfterStartScan: number =
      await this.findAllowBeforeAndAfterStartScan();
    let checkInEnd = dayJs(this.combineDateAndTime(date, time))
      .add(allowBeforeAndAfterStartScan, 'minute')
      .toDate();

    const allowScanInLate = await this.findAllowScanLateIn(date, time);
    if (allowScanInLate > checkInEnd) {
      checkInEnd = allowScanInLate;
    }

    return checkInEnd;
  }

  private async findCheckOutStart(date: Date, time: Date): Promise<Date> {
    const allowBeforeAndAfterEndScan: number =
      await this.findAllowBeforeAndAfterEndScan();
    let checkOutStart = dayJs(this.combineDateAndTime(date, time))
      .add(-allowBeforeAndAfterEndScan, 'minute')
      .toDate();

    const allowScanCheckOutEarly = await this.findAllowScanOutEarly(date, time);

    if (allowScanCheckOutEarly < checkOutStart) {
      checkOutStart = allowScanCheckOutEarly;
    }

    return checkOutStart;
  }

  private findCheckOutEnd(date: Date, time: Date): Date {
    return dayJs(this.combineDateAndTime(date, time)).endOf('day').toDate();
  }

  private async findAllowScanOutEarly(date: Date, time: Date): Promise<Date> {
    const allowScanOutEarly: number = await this.findAllowCheckOutEarly();
    return dayJs(this.combineDateAndTime(date, time))
      .add(-allowScanOutEarly, 'minute')
      .toDate();
  }

  private async findAllowScanLateIn(date: Date, time: Date): Promise<Date> {
    const allowScanLateIn: number = await this.findAllowLateScanIn();
    return dayJs(this.combineDateAndTime(date, time))
      .add(allowScanLateIn, 'minute')
      .toDate();
  }

  private combineDateAndTime(date: Date | string, time: Date | string): Date {
    const dateString = dayJs(date).format(DEFAULT_DATE_FORMAT);
    return dayJs(`${dateString} ${time}`).toDate();
  }

  private async findScanPartByRange(
    fingerPrintId: string,
    startRange: Date,
    endRange: Date
  ): Promise<AttendanceRecord[]> {
    return await this.attendanceRecordRepo.find({
      where: {
        fingerPrintId: fingerPrintId,
        scanTime: Between(startRange, endRange)
      },
      order: {
        scanTime: 'ASC'
      }
    });
  }

  private async findActiveLeaveRequest(
    attendanceReport: AttendanceReport
  ): Promise<AttendanceReport> {
    attendanceReport.leaveRequests = await this.leaveRequestRepo.find({
      where: {
        status: StatusEnum.ACTIVE,
        employee: { id: attendanceReport.employee.id },
        fromDate: LessThanOrEqual(attendanceReport.date),
        toDate: MoreThanOrEqual(attendanceReport.date)
      },
      relations: {
        employee: true,
        leaveTypeVariation: {
          leaveType: true
        }
      }
    });

    return attendanceReport;
  }

  private async findAllowCheckOutEarly(): Promise<number> {
    const globalConfig = await this.grpcService.getGlobalConfigurationByName({
      name: GlobalConfigurationNameEnum.ALLOW_CHECK_OUT_EARLY
    });

    return Number(globalConfig.value);
  }

  private async findAllowLateScanIn(): Promise<number> {
    const globalConfig = await this.grpcService.getGlobalConfigurationByName({
      name: GlobalConfigurationNameEnum.ALLOW_LATE_SCAN_IN
    });

    return Number(globalConfig.value);
  }

  private async findAllowBeforeAndAfterStartScan(): Promise<number> {
    const globalConfig = await this.grpcService.getGlobalConfigurationByName({
      name: GlobalConfigurationNameEnum.ALLOW_BEFORE_AND_AFTER_START_SCAN_DURATION
    });

    return Number(globalConfig.value);
  }

  private async findAllowBeforeAndAfterEndScan(): Promise<number> {
    const globalConfig = await this.grpcService.getGlobalConfigurationByName({
      name: GlobalConfigurationNameEnum.ALLOW_BEFORE_AND_AFTER_END_SCAN_DURATION
    });

    return Number(globalConfig.value);
  }

  private async findRemoveDuplicationScanInMinute(): Promise<number> {
    const globalConfig = await this.grpcService.getGlobalConfigurationByName({
      name: GlobalConfigurationNameEnum.REMOVE_DUPLICATION_SCAN_TIME_IN_MINUTE
    });

    return Number(globalConfig.value);
  }

  private async findScanByPart(
    attendanceReport: AttendanceReport,
    workingSchedule?: EmployeeWorkingSchedule
  ): Promise<AttendanceReport> {
    const workingShift: WorkingShift = attendanceReport.employee.workingShiftId;

    if (workingShift.workshiftType.name === WorkShiftTypeEnum.NORMAL) {
      return await this.findScanPartForNormalEmployee(attendanceReport);
    }

    return await this.findScanPartForRosterEmployee(
      attendanceReport,
      workingSchedule
    );
  }

  private async findScanPartForNormalEmployee(
    attendanceReport: AttendanceReport
  ): Promise<AttendanceReport> {
    const fullLeaveRequest = this.findFullLeaveRequest(
      attendanceReport.leaveRequests
    );

    const firstHaftLeaveRequest = this.findFirstHaftLeaveRequest(
      attendanceReport.leaveRequests
    );

    const secondHaftLeaveRequest = this.findSecondHaftLeaveRequest(
      attendanceReport.leaveRequests
    );

    const fullMissionRequest = this.findFullMissionRequest(
      attendanceReport.missionRequests
    );

    const firstHaftMissionRequest = this.findFirstHaftMissionRequest(
      attendanceReport.missionRequests
    );

    const secondHaftMissionRequest = this.findSecondHaftMissionRequest(
      attendanceReport.missionRequests
    );

    const timeMissionRequest = this.findTimeMissionRequest(
      attendanceReport.missionRequests
    );

    //* Find scan records and remove duplicated
    const actualScans: Date[] = await this.findActualScan(attendanceReport);

    attendanceReport.checkIn = actualScans.at(0);
    attendanceReport.checkOut =
      actualScans.length > 1 ? actualScans.at(-1) : undefined;

    //* Full day request
    if (fullLeaveRequest || fullMissionRequest) {
      attendanceReport.status = AttendanceReportStatusEnum.DAY_OFF;
      return attendanceReport;
    }

    //* Two haft day requests
    if (
      (firstHaftLeaveRequest || firstHaftMissionRequest) &&
      (secondHaftLeaveRequest || secondHaftMissionRequest)
    ) {
      attendanceReport.status = AttendanceReportStatusEnum.DAY_OFF;
      return attendanceReport;
    }

    //* Absent check in or check out
    if (!attendanceReport.checkIn || !attendanceReport.checkOut) {
      attendanceReport.status = AttendanceReportStatusEnum.ABSENT;
    }

    //* Absent break in or break out
    if (attendanceReport.scanType === ScanTypeEnum.FOUR_TIMES) {
      attendanceReport.breakIn = actualScans.at(1);
      attendanceReport.breakOut = actualScans.at(2);

      if (
        (!attendanceReport.breakIn || !attendanceReport.breakOut) &&
        !timeMissionRequest
      ) {
        attendanceReport.status = AttendanceReportStatusEnum.ABSENT;
      }
    }

    return attendanceReport;
  }

  private async findActualScan(
    attendanceReport: AttendanceReport
  ): Promise<Date[]> {
    const attendanceRecords: AttendanceRecord[] =
      await this.findScanPartByRange(
        attendanceReport.employee.fingerPrintId,
        dayJs(attendanceReport.date).startOf('day').toDate(),
        dayJs(attendanceReport.date).endOf('day').toDate()
      );

    const actualScans: Date[] = [];
    const removeDuplicationScanDuration =
      await this.findRemoveDuplicationScanInMinute();
    attendanceRecords.forEach(
      (attendanceRecord: AttendanceRecord, index: number) => {
        const isNotDuplicated =
          this.getDurationInMinute(
            actualScans.at(-1),
            attendanceRecord.scanTime
          ) >= removeDuplicationScanDuration;

        if (index === 0 || isNotDuplicated) {
          actualScans.push(attendanceRecord.scanTime);
        }
      }
    );

    return actualScans;
  }

  private async findScanPartForRosterEmployee(
    attendanceReport: AttendanceReport,
    workingSchedule: EmployeeWorkingSchedule
  ): Promise<AttendanceReport> {
    const workingShift = attendanceReport.employee.workingShiftId;
    const shiftDuration = this.getDurationInMinute(
      this.combineDateAndTime(
        attendanceReport.date,
        workingShift.startWorkingTime
      ),
      this.combineDateAndTime(
        attendanceReport.date,
        workingShift.endWorkingTime
      )
    );

    const haftShiftDuration = (shiftDuration - workingShift.breakTime) / 2;
    const fullLeaveRequest: LeaveRequest | undefined =
      this.findFullLeaveRequest(attendanceReport.leaveRequests);

    const fullMissionRequest: MissionRequest | undefined =
      this.findFullMissionRequest(attendanceReport.missionRequests);

    const firstHaftLeaveRequest: LeaveRequest | undefined =
      this.findFirstHaftLeaveRequest(attendanceReport.leaveRequests);

    const secondHaftLeaveRequest: LeaveRequest | undefined =
      this.findSecondHaftLeaveRequest(attendanceReport.leaveRequests);

    const firstHaftMissionRequest: MissionRequest | undefined =
      this.findFirstHaftMissionRequest(attendanceReport.missionRequests);

    const secondHaftMissionRequest: MissionRequest | undefined =
      this.findSecondHaftMissionRequest(attendanceReport.missionRequests);

    let isNoBreak = false;

    //* Full day request
    if (fullLeaveRequest || fullMissionRequest) {
      attendanceReport.status = AttendanceReportStatusEnum.DAY_OFF;

      return attendanceReport;
    }

    //* Two haft day requests
    if (
      (firstHaftLeaveRequest || firstHaftMissionRequest) &&
      (secondHaftLeaveRequest || secondHaftMissionRequest)
    ) {
      attendanceReport.status = AttendanceReportStatusEnum.DAY_OFF;
      return attendanceReport;
    }

    //* Find scan check in
    let missionOrLeaveDuration = 0;

    if (firstHaftLeaveRequest || firstHaftMissionRequest) {
      missionOrLeaveDuration = haftShiftDuration + workingShift.breakTime;
      isNoBreak = true;
    }

    const missionFromShiftStart = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          dayJs(missionRequest.fromDate).isSame(
            this.combineDateAndTime(
              attendanceReport.date,
              workingSchedule.startWorkingTime
            )
          )
        );
      }
    );

    if (missionFromShiftStart) {
      missionOrLeaveDuration = this.getDurationInMinute(
        missionFromShiftStart.fromDate,
        missionFromShiftStart.toDate
      );

      if (missionOrLeaveDuration >= haftShiftDuration) {
        missionOrLeaveDuration += workingShift.breakTime;
        isNoBreak = true;
      }
    }

    const { attendanceReportCheckIn, checkInEnd } = await this.findCheckIn(
      attendanceReport,
      workingSchedule,
      missionOrLeaveDuration
    );
    attendanceReport = attendanceReportCheckIn;

    //* Find scan check out
    missionOrLeaveDuration = 0;
    if (secondHaftMissionRequest || secondHaftLeaveRequest) {
      missionOrLeaveDuration = haftShiftDuration + workingShift.breakTime;
      isNoBreak = true;
    }
    const missionUntilShiftEnd = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          dayJs(missionRequest.toDate).isSame(
            this.combineDateAndTime(
              attendanceReport.date,
              workingSchedule.endWorkingTime
            )
          )
        );
      }
    );

    if (missionUntilShiftEnd) {
      missionOrLeaveDuration = this.getDurationInMinute(
        missionUntilShiftEnd.fromDate,
        missionUntilShiftEnd.toDate
      );

      if (missionOrLeaveDuration >= haftShiftDuration) {
        missionOrLeaveDuration += workingShift.breakTime;
        isNoBreak = true;
      }
    }
    const { attendanceReportCheckOut, checkOutStart } = await this.findCheckOut(
      attendanceReport,
      workingSchedule,
      missionOrLeaveDuration
    );
    attendanceReport = attendanceReportCheckOut;

    if (!isNoBreak) {
      attendanceReport = await this.findBreakInOut(
        attendanceReport,
        checkInEnd,
        checkOutStart
      );
    }

    if (attendanceReport.scanType === ScanTypeEnum.FOUR_TIMES) {
      //* Check absent on missed scan 4 times
      const isMissedNoBreak =
        !(attendanceReport.checkIn && attendanceReport.checkOut) && isNoBreak;

      const isMissed =
        !(
          attendanceReport.checkIn &&
          attendanceReport.breakIn &&
          attendanceReport.breakOut &&
          attendanceReport.checkOut
        ) && !isNoBreak;

      if (isMissed || isMissedNoBreak) {
        attendanceReport.status = AttendanceReportStatusEnum.ABSENT;
      }
    } else if (attendanceReport.scanType === ScanTypeEnum.TWO_TIMES) {
      //* Check absent on missed scan 2 times
      if (!(attendanceReport.checkIn && attendanceReport.checkOut)) {
        attendanceReport.status = AttendanceReportStatusEnum.ABSENT;
      }
    }

    return attendanceReport;
  }

  private findTimeMissionRequest(
    missionRequests: MissionRequest[]
  ): MissionRequest | undefined {
    return missionRequests.find(
      (missionRequest) =>
        missionRequest.durationType === MissionRequestDurationTypeEnEnum.TIME
    );
  }

  findSecondHaftMissionRequest(
    missionRequests: MissionRequest[]
  ): MissionRequest | undefined {
    return missionRequests.find(
      (missionRequest) =>
        missionRequest.durationType ===
        MissionRequestDurationTypeEnEnum.SECOND_HALF_DAY
    );
  }

  private findFirstHaftMissionRequest(
    missionRequests: MissionRequest[]
  ): MissionRequest | undefined {
    return missionRequests.find(
      (missionRequest) =>
        missionRequest.durationType ===
        MissionRequestDurationTypeEnEnum.FIRST_HALF_DAY
    );
  }

  findFullMissionRequest(
    missionRequests: MissionRequest[]
  ): MissionRequest | undefined {
    return missionRequests.find(
      (missionRequest) =>
        missionRequest.durationType ===
        MissionRequestDurationTypeEnEnum.DATE_RANGE
    );
  }

  private findSecondHaftLeaveRequest(
    leaveRequests: LeaveRequest[]
  ): LeaveRequest | undefined {
    return leaveRequests.find(
      (leaveRequest) =>
        leaveRequest.durationType ===
          LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY &&
        !leaveRequest.leaveTypeVariation.leaveType.isPublicHoliday
    );
  }

  private findFirstHaftLeaveRequest(
    leaveRequests: LeaveRequest[]
  ): LeaveRequest | undefined {
    return leaveRequests.find(
      (leaveRequest) =>
        leaveRequest.durationType ===
          LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY &&
        !leaveRequest.leaveTypeVariation.leaveType.isPublicHoliday
    );
  }

  private findFullLeaveRequest(
    leaveRequests: LeaveRequest[]
  ): LeaveRequest | undefined {
    return leaveRequests.find(
      (leaveRequest) =>
        leaveRequest.durationType ===
          LeaveRequestDurationTypeEnEnum.DATE_RANGE &&
        !leaveRequest.leaveTypeVariation.leaveType.isPublicHoliday
    );
  }

  private findPublicHolidayLeaveRequest(
    leaveRequests: LeaveRequest[]
  ): LeaveRequest | undefined {
    return leaveRequests.find(
      (leaveRequest) =>
        leaveRequest.leaveTypeVariation.leaveType.isPublicHoliday
    );
  }

  private async findBreakInOut(
    attendanceReport: AttendanceReport,
    checkInEnd: Date,
    checkOutStart: Date
  ): Promise<AttendanceReport> {
    if (attendanceReport.scanType === ScanTypeEnum.FOUR_TIMES) {
      //* Find scan break in
      const breakIns = await this.findScanPartByRange(
        attendanceReport.employee.fingerPrintId,
        checkInEnd,
        checkOutStart
      );
      attendanceReport.breakIn = breakIns.at(0)?.scanTime;

      //* Find scan break out
      if (attendanceReport.breakIn) {
        const part3s: AttendanceRecord[] = await this.findScanPartByRange(
          attendanceReport.employee.fingerPrintId,
          attendanceReport.breakIn,
          checkOutStart
        );
        attendanceReport.breakOut = part3s.at(part3s.length - 1)?.scanTime;

        //* Scan duplicated scan
        const removeDuplicationScanDuration: number =
          await this.findRemoveDuplicationScanInMinute();
        if (
          this.getDurationInMinute(
            attendanceReport.breakIn,
            attendanceReport.breakOut
          ) < removeDuplicationScanDuration
        ) {
          attendanceReport.breakOut = undefined;
        }
      }
    }

    return attendanceReport;
  }

  private async findCheckOut(
    attendanceReport: AttendanceReport,
    workingSchedule?: EmployeeWorkingSchedule,
    missionOrLeaveDuration?: number
  ): Promise<{
    attendanceReportCheckOut: AttendanceReport;
    checkOutStart: Date;
  }> {
    let checkOutStart = await this.findCheckOutStart(
      attendanceReport.date,
      workingSchedule.endWorkingTime
    );

    checkOutStart = dayJs(checkOutStart)
      .add(-(missionOrLeaveDuration ?? 0), 'minute')
      .toDate();

    //* Until end of day
    const checkOutEnd = this.findCheckOutEnd(
      attendanceReport.date,
      workingSchedule.endWorkingTime
    );
    const checkOuts = await this.findScanPartByRange(
      attendanceReport.employee.fingerPrintId,
      checkOutStart,
      checkOutEnd
    );

    //* From allow scan check out early until end of day
    attendanceReport.checkOut = checkOuts.at(-1)?.scanTime;

    //* Absent when check out before allow scan out early
    if (attendanceReport.checkOut) {
      let allowScanOutEarly: Date = await this.findAllowScanOutEarly(
        attendanceReport.date,
        workingSchedule.endWorkingTime
      );

      allowScanOutEarly = dayJs(allowScanOutEarly)
        .add(-(missionOrLeaveDuration ?? 0), 'minute')
        .toDate();

      if (dayJs(attendanceReport.checkOut).isBefore(allowScanOutEarly)) {
        attendanceReport.status = AttendanceReportStatusEnum.ABSENT;
      }
    }

    return {
      attendanceReportCheckOut: attendanceReport,
      checkOutStart
    };
  }

  private async findCheckIn(
    attendanceReport: AttendanceReport,
    workingSchedule: EmployeeWorkingSchedule,
    missionOrLeaveDuration?: number
  ): Promise<{ attendanceReportCheckIn: AttendanceReport; checkInEnd: Date }> {
    //* From the beginning of day
    let checkInStart: Date = this.findCheckInStart(
      attendanceReport.date,
      workingSchedule.startWorkingTime
    );

    checkInStart = dayJs(checkInStart)
      .add(missionOrLeaveDuration, 'minute')
      .toDate();

    let checkInEnd: Date = await this.findCheckInEnd(
      attendanceReport.date,
      workingSchedule.startWorkingTime
    );

    checkInEnd = dayJs(checkInEnd)
      .add(missionOrLeaveDuration ?? 0, 'minute')
      .toDate();

    const checkIns: AttendanceRecord[] = await this.findScanPartByRange(
      attendanceReport.employee.fingerPrintId,
      checkInStart,
      checkInEnd
    );

    //* From beginning of day until allow scan in late
    attendanceReport.checkIn = checkIns.at(-1)?.scanTime;

    //* Absent when late over limitation
    if (attendanceReport.checkIn) {
      let allowScanInLate = await this.findAllowScanLateIn(
        attendanceReport.date,
        workingSchedule.startWorkingTime
      );

      allowScanInLate = dayJs(allowScanInLate)
        .add(missionOrLeaveDuration ?? 0, 'minute')
        .toDate();

      if (attendanceReport.checkIn > allowScanInLate) {
        attendanceReport.status = AttendanceReportStatusEnum.ABSENT;
      }
    }

    return { attendanceReportCheckIn: attendanceReport, checkInEnd };
  }

  private initializeAttendanceReport(
    employee: Employee,
    reportDate: Date
  ): AttendanceReport {
    return {
      employee: employee,
      date: reportDate,
      scanType: employee.workingShiftId.scanType,
      lateCheckIn: 0,
      breakInEarly: 0,
      lateBreakOut: 0,
      checkOutEarly: 0,
      workingHour: '0',
      otDuration: '0',
      status: AttendanceReportStatusEnum.PRESENT
    } as AttendanceReport;
  }

  private async findPublicHolidayByDate(
    reportDate: Date
  ): Promise<PublicHoliday> {
    return await this.publicHolidayRepo.findOne({
      where: { date: reportDate }
    });
  }

  private async findOverTimeRequestForAttendanceReport(
    attendanceReport: AttendanceReport
  ): Promise<AttendanceReport> {
    attendanceReport.overtimeRequests = await this.overtimeRequestRepo.find({
      where: {
        employee: {
          id: attendanceReport.employee.id
        },
        requestDate: attendanceReport.date,
        status: StatusEnum.ACTIVE
      }
    });

    let otDurationInMinute = 0;

    for (const overtimeRequest of attendanceReport.overtimeRequests) {
      if (overtimeRequest.overtimeType === OvertimeTypeEnum.HOUR) {
        const otStart = this.combineDateAndTime(
          overtimeRequest.requestDate,
          overtimeRequest.startTime
        );
        const otEnd = this.combineDateAndTime(
          overtimeRequest.requestDate,
          overtimeRequest.endTime
        );

        otDurationInMinute += this.getDurationInMinute(otStart, otEnd);
      } else if (
        overtimeRequest.overtimeType === OvertimeTypeEnum.WORKING_SHIFT
      ) {
        const workingShift = attendanceReport.employee.workingShiftId;
        const shiftDuration = this.getDurationInMinute(
          this.combineDateAndTime(
            attendanceReport.date,
            workingShift.startWorkingTime
          ),
          this.combineDateAndTime(
            attendanceReport.date,
            workingShift.endWorkingTime
          )
        );

        otDurationInMinute += shiftDuration - workingShift.breakTime;
      }
    }

    if (otDurationInMinute) {
      attendanceReport.otDuration = formatMinuteToHHmm(otDurationInMinute);
    }

    return attendanceReport;
  }

  private async findActiveDayOffRequest(
    attendanceReport: AttendanceReport
  ): Promise<AttendanceReport> {
    attendanceReport.dayOffRequest = await this.dayOffRequestRepo.findOne({
      where: {
        employee: {
          id: attendanceReport.employee.id
        },
        dayOffDate: attendanceReport.date,
        status: StatusEnum.ACTIVE
      }
    });

    const publicHolidayLeave = this.findPublicHolidayLeaveRequest(
      attendanceReport.leaveRequests
    );

    if (attendanceReport.dayOffRequest || publicHolidayLeave) {
      attendanceReport.status = AttendanceReportStatusEnum.DAY_OFF;
    }

    return attendanceReport;
  }

  private getLateScanIn(scan: Date, startShift: Date): number {
    if (!dayJs(scan).isBefore(startShift)) {
      return this.getDurationInMinute(startShift, scan);
    }
    return 0;
  }

  private getLateScanOut(scan: Date, startShift: Date): number {
    if (!dayJs(scan).isAfter(startShift)) {
      return this.getDurationInMinute(scan, startShift);
    }
    return 0;
  }

  private async calculateLateForNormalEmployee(
    attendanceReport: AttendanceReport
  ): Promise<AttendanceReport> {
    const workingShift = attendanceReport.employee.workingShiftId;
    const shiftDuration = this.getDurationInMinute(
      this.combineDateAndTime(
        attendanceReport.date,
        workingShift.startWorkingTime
      ),
      this.combineDateAndTime(
        attendanceReport.date,
        workingShift.endWorkingTime
      )
    );

    const haftShiftDuration = (shiftDuration - workingShift.breakTime) / 2;

    const firstHaftLeaveRequest = this.findFirstHaftLeaveRequest(
      attendanceReport.leaveRequests
    );

    const secondHaftLeaveRequest = this.findSecondHaftLeaveRequest(
      attendanceReport.leaveRequests
    );

    const firstHaftMissionRequest = this.findFirstHaftMissionRequest(
      attendanceReport.missionRequests
    );

    const secondHaftMissionRequest = this.findSecondHaftMissionRequest(
      attendanceReport.missionRequests
    );

    //#region //* Find scan time by working shift
    let startShift: Date = this.combineDateAndTime(
      attendanceReport.date,
      workingShift.startWorkingTime
    );

    let shiftBreakStart: Date = this.combineDateAndTime(
      attendanceReport.date,
      workingShift.endScanTimePartOne
    );

    let shiftBreakEnd: Date = this.combineDateAndTime(
      attendanceReport.date,
      workingShift.startScanTimePartTwo
    );

    //* Find end shift time for normal day and weekend day
    const endShiftTime = isSaturday(attendanceReport.date)
      ? workingShift.weekendScanTime
      : workingShift.endWorkingTime;
    let endShift: Date = this.combineDateAndTime(
      attendanceReport.date,
      endShiftTime
    );
    //#endregion

    if (firstHaftLeaveRequest || firstHaftMissionRequest) {
      startShift = dayJs(startShift)
        .add(haftShiftDuration + workingShift.breakTime, 'minute')
        .toDate();

      attendanceReport.breakIn = undefined;
      attendanceReport.breakOut = undefined;
    }

    if (secondHaftLeaveRequest || secondHaftMissionRequest) {
      endShift = dayJs(endShift)
        .add(-(haftShiftDuration + workingShift.breakTime), 'minute')
        .toDate();

      attendanceReport.breakIn = undefined;
      attendanceReport.breakOut = undefined;
    }

    const missionFromShiftStart = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          dayJs(missionRequest.fromDate).isSame(startShift)
        );
      }
    );

    if (missionFromShiftStart) {
      const missionDuration = this.getDurationInMinute(
        missionFromShiftStart.fromDate,
        missionFromShiftStart.toDate
      );

      startShift = dayJs(startShift).add(missionDuration, 'minute').toDate();

      if (missionDuration >= haftShiftDuration) {
        attendanceReport.breakIn = undefined;
        attendanceReport.breakOut = undefined;
        startShift = dayJs(startShift)
          .add(workingShift.breakTime, 'minute')
          .toDate();
      }
    }

    const missionUntilShiftEnd = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          dayJs(missionRequest.toDate).isSame(endShift)
        );
      }
    );

    if (missionUntilShiftEnd) {
      const missionDuration = this.getDurationInMinute(
        missionUntilShiftEnd.fromDate,
        missionUntilShiftEnd.toDate
      );

      endShift = dayJs(endShift).add(-missionDuration, 'minute').toDate();

      if (missionDuration >= haftShiftDuration) {
        attendanceReport.breakIn = undefined;
        attendanceReport.breakOut = undefined;
        endShift = dayJs(endShift)
          .add(-workingShift.breakTime, 'minute')
          .toDate();
      }
    }

    const missionBetweenShift = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          !dayJs(missionRequest.fromDate).isSame(startShift) &&
          !dayJs(missionRequest.toDate).isSame(endShift)
        );
      }
    );

    if (missionBetweenShift) {
      const missionDuration = this.getDurationInMinute(
        missionBetweenShift.fromDate,
        missionBetweenShift.toDate
      );

      if (missionDuration > haftShiftDuration) {
        attendanceReport.breakIn = undefined;
        attendanceReport.breakOut = undefined;
      } else if (missionDuration === haftShiftDuration) {
        shiftBreakStart = dayJs(missionBetweenShift.fromDate).toDate();
        shiftBreakEnd = dayJs(missionBetweenShift.toDate).toDate();
      }
    }

    //#region //* Find scan time to calculate working hour and late
    let scan1 = attendanceReport.checkIn;
    if (dayJs(attendanceReport.checkIn).isBefore(startShift)) {
      scan1 = startShift;
    }

    let scan2 = attendanceReport.breakIn;
    if (dayJs(attendanceReport.breakIn).isAfter(shiftBreakStart)) {
      scan2 = shiftBreakStart;
    }

    let scan3 = attendanceReport.breakOut;
    if (dayJs(attendanceReport.breakOut).isBefore(shiftBreakEnd)) {
      scan3 = shiftBreakEnd;
    }

    let scan4 = attendanceReport.checkOut;
    if (dayJs(attendanceReport.checkOut).isAfter(endShift)) {
      scan4 = endShift;
    }
    //#endregion

    //#endregion

    //#region //* Calculate late
    if (attendanceReport.checkIn) {
      attendanceReport.lateCheckIn = this.getLateScanIn(scan1, startShift);
    }

    if (attendanceReport.breakIn) {
      attendanceReport.breakInEarly = this.getLateScanOut(
        scan2,
        shiftBreakStart
      );
    }

    if (attendanceReport.breakOut) {
      attendanceReport.lateBreakOut = this.getLateScanIn(scan3, shiftBreakEnd);
    }

    if (attendanceReport.checkOut) {
      attendanceReport.checkOutEarly = this.getLateScanOut(scan4, endShift);
    }
    //#endregion

    //#region //* Late over limitation will be absent
    const allowLateScanIn: number = await this.findAllowLateScanIn();
    const allowCheckOutEarly: number = await this.findAllowCheckOutEarly();

    if (
      attendanceReport.lateCheckIn > allowLateScanIn ||
      attendanceReport.breakInEarly > allowCheckOutEarly ||
      attendanceReport.lateBreakOut > allowLateScanIn ||
      attendanceReport.checkOutEarly > allowCheckOutEarly
    ) {
      attendanceReport.status = AttendanceReportStatusEnum.ABSENT;
    }
    //#endregion

    //#region //* Calculate working hour
    attendanceReport =
      this.calculateWorkingHourForNormalEmployee(attendanceReport);

    return attendanceReport;
  }

  private calculateWorkingHourForNormalEmployee(
    attendanceReport: AttendanceReport
  ): AttendanceReport {
    const workingShift = attendanceReport.employee.workingShiftId;
    if (attendanceReport.checkIn && attendanceReport.checkOut) {
      const workingDuration = this.getDurationInMinute(
        this.combineDateAndTime(
          attendanceReport.date,
          workingShift.startWorkingTime
        ),
        this.combineDateAndTime(
          attendanceReport.date,
          isSaturday(attendanceReport.date)
            ? workingShift.weekendScanTime
            : workingShift.endWorkingTime
        )
      );

      const totalLate =
        attendanceReport.lateCheckIn +
        attendanceReport.breakInEarly +
        attendanceReport.lateBreakOut +
        attendanceReport.checkOutEarly;

      const breakDuration = isSaturday(attendanceReport.date)
        ? 0
        : workingShift.breakTime;

      const leaveDuration =
        ((workingDuration - breakDuration) / 2) *
        attendanceReport.leaveRequests.length;

      attendanceReport.workingHour = formatMinuteToHHmm(
        workingDuration - breakDuration - totalLate - leaveDuration
      );
    }
    return attendanceReport;
  }

  private calculateWorkingHourForRosterEmployee(
    attendanceReport: AttendanceReport
  ): AttendanceReport {
    const workingShift = attendanceReport.employee.workingShiftId;
    if (attendanceReport.checkIn && attendanceReport.checkOut) {
      const workingDuration = this.getDurationInMinute(
        this.combineDateAndTime(
          attendanceReport.date,
          workingShift.startWorkingTime
        ),
        this.combineDateAndTime(
          attendanceReport.date,
          workingShift.endWorkingTime
        )
      );

      const totalLate =
        attendanceReport.lateCheckIn +
        attendanceReport.breakInEarly +
        attendanceReport.lateBreakOut +
        attendanceReport.checkOutEarly;

      const breakDuration = workingShift.breakTime;

      const leaveDuration =
        ((workingDuration - breakDuration) / 2) *
        attendanceReport.leaveRequests.length;

      attendanceReport.workingHour = formatMinuteToHHmm(
        workingDuration - breakDuration - totalLate - leaveDuration
      );
    }
    return attendanceReport;
  }

  private calculateLateForRosterEmployee(
    attendanceReport: AttendanceReport,
    workingSchedule: EmployeeWorkingSchedule
  ): AttendanceReport {
    const workingShift = attendanceReport.employee.workingShiftId;
    const shiftDuration = this.getDurationInMinute(
      this.combineDateAndTime(
        attendanceReport.date,
        workingShift.startWorkingTime
      ),
      this.combineDateAndTime(
        attendanceReport.date,
        workingShift.endWorkingTime
      )
    );

    const haftShiftDuration = (shiftDuration - workingShift.breakTime) / 2;

    const firstHaftLeaveRequest = this.findFirstHaftLeaveRequest(
      attendanceReport.leaveRequests
    );

    const secondHaftLeaveRequest = this.findSecondHaftLeaveRequest(
      attendanceReport.leaveRequests
    );

    const firstHaftMissionRequest = this.findFirstHaftMissionRequest(
      attendanceReport.missionRequests
    );

    const secondHaftMissionRequest = this.findSecondHaftMissionRequest(
      attendanceReport.missionRequests
    );

    let startShift: Date = this.combineDateAndTime(
      attendanceReport.date,
      workingSchedule.startWorkingTime
    );

    let endShift: Date = this.combineDateAndTime(
      attendanceReport.date,
      workingSchedule.endWorkingTime
    );

    if (firstHaftLeaveRequest || firstHaftMissionRequest) {
      startShift = dayJs(startShift)
        .add(haftShiftDuration + workingShift.breakTime, 'minute')
        .toDate();
    }

    if (secondHaftLeaveRequest || secondHaftMissionRequest) {
      endShift = dayJs(endShift)
        .add(-(haftShiftDuration + workingShift.breakTime), 'minute')
        .toDate();
    }

    const missionFromShiftStart = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          dayJs(missionRequest.fromDate).isSame(startShift)
        );
      }
    );

    if (missionFromShiftStart) {
      const missionDuration = this.getDurationInMinute(
        missionFromShiftStart.fromDate,
        missionFromShiftStart.toDate
      );

      startShift = dayJs(startShift).add(missionDuration, 'minute').toDate();

      if (missionDuration >= haftShiftDuration) {
        attendanceReport.breakIn = undefined;
        attendanceReport.breakOut = undefined;
        startShift = dayJs(startShift)
          .add(workingShift.breakTime, 'minute')
          .toDate();
      }
    }

    const missionUntilShiftEnd = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          dayJs(missionRequest.toDate).isSame(endShift)
        );
      }
    );

    if (missionUntilShiftEnd) {
      const missionDuration = this.getDurationInMinute(
        missionUntilShiftEnd.fromDate,
        missionUntilShiftEnd.toDate
      );

      endShift = dayJs(endShift).add(-missionDuration, 'minute').toDate();

      if (missionDuration >= haftShiftDuration) {
        attendanceReport.breakIn = undefined;
        attendanceReport.breakOut = undefined;
        endShift = dayJs(endShift)
          .add(-workingShift.breakTime, 'minute')
          .toDate();
      }
    }

    const missionBetweenShift = attendanceReport.missionRequests.find(
      (missionRequest) => {
        return (
          missionRequest.durationType ===
            MissionRequestDurationTypeEnEnum.TIME &&
          !dayJs(missionRequest.fromDate).isSame(startShift) &&
          !dayJs(missionRequest.toDate).isSame(endShift)
        );
      }
    );

    let missionBetweenShiftDuration = 0;
    if (missionBetweenShift) {
      const missionDuration = this.getDurationInMinute(
        missionBetweenShift.fromDate,
        missionBetweenShift.toDate
      );

      if (missionDuration >= haftShiftDuration) {
        attendanceReport.breakIn = undefined;
        attendanceReport.breakOut = undefined;
        missionBetweenShiftDuration = missionDuration;
      }
    }

    let scan1 = attendanceReport.checkIn;
    if (dayJs(attendanceReport.checkIn).isBefore(startShift)) {
      scan1 = startShift;
    }

    let scan4 = attendanceReport.checkOut;
    if (dayJs(attendanceReport.checkOut).isAfter(endShift)) {
      scan4 = endShift;
    }

    // Calculate late check in and out
    if (attendanceReport.checkIn) {
      attendanceReport.lateCheckIn = this.getLateScanIn(scan1, startShift);
    }

    if (attendanceReport.checkOut) {
      attendanceReport.checkOutEarly = this.getLateScanOut(scan4, endShift);
    }

    if (attendanceReport.checkIn && attendanceReport.checkOut) {
      const breakTime =
        attendanceReport.employee.workingShiftId.breakTime +
        missionBetweenShiftDuration;
      if (attendanceReport.breakIn && attendanceReport.breakOut) {
        const breakDuration = this.getDurationInMinute(
          attendanceReport.breakIn,
          attendanceReport.breakOut
        );
        if (breakDuration > breakTime) {
          //* Calculate late break out
          attendanceReport.lateBreakOut = breakDuration - breakTime;
        }
      }

      //* Calculate working hour
      attendanceReport =
        this.calculateWorkingHourForRosterEmployee(attendanceReport);
    }

    return attendanceReport;
  }

  private async generateAttendanceReportForNormalEmployee(
    queryRunner: QueryRunner,
    employee: Employee,
    reportDate: Date
  ): Promise<void> {
    let attendanceReport: AttendanceReport = this.initializeAttendanceReport(
      employee,
      reportDate
    );
    const workingShift: WorkingShift = employee.workingShiftId;

    const publicHoliday: PublicHoliday | null =
      await this.findPublicHolidayByDate(reportDate);

    //* Find leave requests
    attendanceReport = await this.findActiveLeaveRequest(attendanceReport);

    //* Find mission requests
    attendanceReport = await this.findActiveMissionRequest(attendanceReport);

    //* Find scan record by part
    attendanceReport = await this.findScanByPart(attendanceReport);

    if (attendanceReport.status !== AttendanceReportStatusEnum.ABSENT) {
      //* Calculate late
      attendanceReport =
        await this.calculateLateForNormalEmployee(attendanceReport);

      //* Find overtime requests and calculate duration
      attendanceReport =
        await this.findOverTimeRequestForAttendanceReport(attendanceReport);
    }

    //#region //* On day off
    const isNotWorkOnSunday: boolean = isSunday(reportDate);
    const isNotworkOnSaturday: boolean =
      isSaturday(reportDate) && !workingShift.workOnWeekend;

    const publicHolidayLeave = this.findPublicHolidayLeaveRequest(
      attendanceReport.leaveRequests
    );

    if (
      isNotWorkOnSunday ||
      isNotworkOnSaturday ||
      publicHolidayLeave ||
      publicHoliday
    ) {
      attendanceReport.status = AttendanceReportStatusEnum.DAY_OFF;
    }
    //#endregion

    const createdRecord = this.attendanceReportRepo.create(attendanceReport);

    await queryRunner.manager.save(createdRecord);
  }

  private async generateAttendanceReportForRosterEmployee(
    queryRunner: QueryRunner,
    employee: Employee,
    reportDate: Date
  ): Promise<void> {
    let attendanceReport: AttendanceReport = this.initializeAttendanceReport(
      employee,
      reportDate
    );

    const workingSchedule: EmployeeWorkingSchedule | null =
      await this.findEmployeeWorkingSchedule(employee, reportDate);

    //* Skip when roster has no working schedule
    if (!workingSchedule) {
      return;
    }

    //* Find leave requests
    attendanceReport = await this.findActiveLeaveRequest(attendanceReport);

    //* Find day off requests
    attendanceReport = await this.findActiveDayOffRequest(attendanceReport);

    //* Find mission requests
    attendanceReport = await this.findActiveMissionRequest(attendanceReport);

    //* Find scan record by part
    attendanceReport = await this.findScanByPart(
      attendanceReport,
      workingSchedule
    );

    if (attendanceReport.status !== AttendanceReportStatusEnum.ABSENT) {
      //* Find over time requests and calculate duration
      attendanceReport =
        await this.findOverTimeRequestForAttendanceReport(attendanceReport);

      //* Calculate late for roster employee
      attendanceReport = this.calculateLateForRosterEmployee(
        attendanceReport,
        workingSchedule
      );
    }

    if (attendanceReport.dayOffRequest) {
      attendanceReport.status = AttendanceReportStatusEnum.DAY_OFF;
    }

    const createdRecord = queryRunner.manager.create(
      AttendanceReport,
      attendanceReport
    );

    await queryRunner.manager.save(createdRecord);
  }

  private async runAttendanceReportTransaction(
    queryRunner: QueryRunner,
    existingReports: AttendanceReport[],
    normalEmployees: Employee[],
    rosterEmployees: Employee[],
    reportDate: Date
  ): Promise<void> {
    //* Remove existing report to re-generate for specific employee
    if (existingReports.length) {
      await queryRunner.manager.remove(existingReports);
    }

    //* Generate attendance report for all in probation or active normal employees
    for (const employee of normalEmployees) {
      await this.generateAttendanceReportForNormalEmployee(
        queryRunner,
        employee,
        reportDate
      );
    }

    //* Generate attendance report for all active roster employees
    for (const employee of rosterEmployees) {
      await this.generateAttendanceReportForRosterEmployee(
        queryRunner,
        employee,
        reportDate
      );
    }
  }
  //#endregion
}
