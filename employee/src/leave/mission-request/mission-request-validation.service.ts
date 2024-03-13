import { Inject, Injectable, Logger } from '@nestjs/common';
import { Dayjs } from 'dayjs';
import { EmployeeWorkingSchedule } from '../../employee-working-schedule/entities/employee-working-schedule.entity';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { dayJs } from '../../shared-resources/common/utils/date-utils';
import { ResourceConflictException } from '../../shared-resources/exception/conflict-resource.exception';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_TIME_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import { GrpcService } from '../../grpc/grpc.service';
import { globalConfigurationDto } from '../../shared-resources/proto/authentication/authentication.pb';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import { Employee } from '../../employee/entity/employee.entity';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { IEmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/interface/employee-working-schedule.repository.interface';
import { CreateMissionRequestDto } from './dto/create-mission-request.dto';
import { MissionRequestDurationTypeEnEnum } from './enum/mission-request-duration-type.enum';
import { UpdateMissionRequestDto } from './dto/update-mission-request.dto';

export interface IEmployeeWorkingTime {
  startWorkingTime: Dayjs;
  endWorkingTime: Dayjs;
}

@Injectable()
export class MissionRequestValidationService {
  constructor(
    @Inject(EmployeeWorkingScheduleRepository)
    private readonly employeeWorkingScheduleRepo: IEmployeeWorkingScheduleRepository,
    private readonly grpcService: GrpcService
  ) {}

  async getEmployeeWorkingSchedule(
    createMissionRequestDto: CreateMissionRequestDto | UpdateMissionRequestDto
  ): Promise<EmployeeWorkingSchedule> {
    const requestDate: any = dayJs(createMissionRequestDto.fromDate)
      .utc(true)
      .format(DEFAULT_DATE_FORMAT);
    const employeeWorkingSchedule: EmployeeWorkingSchedule =
      await this.employeeWorkingScheduleRepo.findOne({
        where: {
          employeeId: { id: createMissionRequestDto.employeeId },
          scheduleDate: requestDate
        }
      });

    if (!employeeWorkingSchedule) {
      throw new ResourceNotFoundException(
        `Resource of employee working schedule with employee id ${createMissionRequestDto.employeeId} not found`
      );
    }

    return employeeWorkingSchedule;
  }

  async checkWorkingSchedule(
    createMissionRequestDto: CreateMissionRequestDto | UpdateMissionRequestDto,
    employee: Employee
  ): Promise<void> {
    const employeeWorkingTime = await this.checkEmployeeType(
      employee,
      createMissionRequestDto
    );
    if (
      createMissionRequestDto?.durationType ===
      MissionRequestDurationTypeEnEnum.TIME
    ) {
      const { fromTime, toTime } = this.getTimeOfRequestFromDateToDate(
        createMissionRequestDto.fromDate,
        createMissionRequestDto.toDate
      );

      this.checkRequestDateWithWorkingSchedule(
        employeeWorkingTime,
        fromTime,
        toTime
      );

      this.validateFromDateToDateWithDurationType(createMissionRequestDto);
    }

    await this.checkFromDateIsBackDayOrNot(createMissionRequestDto?.fromDate);
  }

  async checkEmployeeType(
    employee: any,
    createMissionRequestDto: CreateMissionRequestDto | UpdateMissionRequestDto
  ): Promise<IEmployeeWorkingTime> {
    const employeeType = employee?.workingShiftId?.workshiftType?.name;
    let employeeWorkingTime: IEmployeeWorkingTime;
    if (employeeType !== 'NORMAL') {
      const employeeWorkingSchedule: any =
        await this.getEmployeeWorkingSchedule(createMissionRequestDto);

      employeeWorkingTime = {
        startWorkingTime: dayJs(
          employeeWorkingSchedule.startWorkingTime,
          DEFAULT_TIME_FORMAT
        ).utc(true),
        endWorkingTime: dayJs(
          employeeWorkingSchedule.endWorkingTime,
          DEFAULT_TIME_FORMAT
        ).utc(true)
      };
    } else {
      employeeWorkingTime = {
        startWorkingTime: dayJs(
          employee?.workingShiftId?.startWorkingTime,
          DEFAULT_TIME_FORMAT
        ).utc(true),
        endWorkingTime: dayJs(
          employee?.workingShiftId?.endWorkingTime,
          DEFAULT_TIME_FORMAT
        ).utc(true)
      };
    }

    return employeeWorkingTime;
  }

  /**
   * Get time from fromDate and toDate
   * @param requestFromDate
   * @param requestToDate
   */
  getTimeOfRequestFromDateToDate(
    requestFromDate: string | Date,
    requestToDate: string | Date
  ) {
    const fromTime = dayJs(requestFromDate).utc(true);

    const toTime = dayJs(requestToDate).utc(true);
    return { fromTime, toTime };
  }

  /**
   * Handle throwing error message if fromTime or toTime is in working schedule.
   * @param employeeWorkingSchedule
   * @param fromTime
   * @param toTime
   */
  checkRequestDateWithWorkingSchedule(
    employeeWorkingSchedule: IEmployeeWorkingTime,
    fromTime: Dayjs,
    toTime: Dayjs
  ) {
    const { startWorkingTime, endWorkingTime } = employeeWorkingSchedule;

    if (
      startWorkingTime.isBetween(fromTime, toTime) ||
      endWorkingTime.isBetween(fromTime, toTime)
    ) {
      throw new ResourceBadRequestException(
        'Mission request',
        'Mission request fromDate and toDate must not be during working schedule.'
      );
    }
  }

  /**
   * Check whether fromDate and toDate is in the same day or not with durationType as TIME.
   * If it it not, throw error message.
   * @param createMissionRequestDto
   */
  validateFromDateToDateWithDurationType(
    createMissionRequestDto: CreateMissionRequestDto | UpdateMissionRequestDto
  ) {
    const isDurationTime: boolean =
      createMissionRequestDto?.durationType ===
      MissionRequestDurationTypeEnEnum.TIME;
    if (isDurationTime) {
      const isTheSameDay: boolean = dayJs(
        createMissionRequestDto.fromDate
      ).isSame(createMissionRequestDto.toDate, 'day');

      if (!isTheSameDay) {
        throw new ResourceConflictException(
          `You are not allowed to request mission in different day with durationType as TIME.`
        );
      }
    }
  }

  /**
   * Check whether fromDate is before current date and before payroll date or not.
   * @param requestFromDate
   */
  async checkFromDateIsBackDayOrNot(requestFromDate: string) {
    const dateTime = new Date();
    const currentDate = dayJs(dateTime)
      .utc(true)
      .format(DEFAULT_DATE_TIME_FORMAT);
    const fromDate = dayJs(requestFromDate)
      .utc(true)
      .format(DEFAULT_DATE_TIME_FORMAT);
    const isBackDate = dayJs(fromDate).utc(true).isBefore(currentDate);

    const payrollDay = await this.getPayrollDay();

    const payrollDate = dayJs()
      .utc(true)
      .set('day', Number(payrollDay.value))
      .format(DEFAULT_DATE_TIME_FORMAT);

    const isAfterPayrollDate = dayJs(fromDate).isAfter(payrollDate, 'day');

    if (isAfterPayrollDate) {
      throw new ResourceBadRequestException(
        'Mission request must be before payroll date.'
      );
    }

    if (isBackDate && !isAfterPayrollDate) {
      Logger.log('Implement here');
    }
  }

  async getPayrollDay(): Promise<globalConfigurationDto> {
    const globalConfiguration: globalConfigurationDto =
      await this.grpcService.getGlobalConfigurationByName({
        name: 'payroll-generate-date'
      });

    if (!globalConfiguration) {
      throw new ResourceNotFoundException('payroll generation date');
    }

    return globalConfiguration;
  }

  checkWeekendDays(fromDate: string, toDate: string) {
    let weekendDayCount = 0;
    while (dayJs(fromDate).isBefore(toDate) || dayJs(fromDate).isSame(toDate)) {
      if (this.isWeekend(fromDate)) {
        weekendDayCount++;
      }
    }

    if (weekendDayCount > 0) {
      throw new ResourceBadRequestException(
        `You are not allowed to request mission during weekend days.`
      );
    }
  }

  isWeekend(date: string) {
    const dayOfWeek = dayJs(date).get('day');
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
}
