import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  Equal,
  In,
  MoreThanOrEqual,
  Repository
} from 'typeorm';
import { Dayjs } from 'dayjs';
import {
  dayJs,
  getCurrentDate
} from '../shared-resources/common/utils/date-utils';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import {
  DEFAULT_MONTH_FORMAT,
  DEFAULT_DATE_FORMAT
} from '../shared-resources/common/dto/default-date-format';
import { WorkShiftTypeEnum } from '../workshift-type/common/ts/enum/workshift-type.enum';
import { WorkingShift } from '../workshift-type/entities/working-shift.entity';
import { GrpcService } from '../grpc/grpc.service';
import { AttendanceReportService } from '../attendance/attendance-report/attendance-report.service';
import { EmployeeActiveStatusEnum } from '../employee/enum/employee-status.enum';
import { JobSchedulerLogTypeEnum } from './../enum/job-scheduler-log.enum';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeWorkingScheduleConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { EmployeeWorkingSchedule } from './entities/employee-working-schedule.entity';
import { EmployeeWarningPaginationDto } from './dto/employee-working-schedule.dto';
import { UpdateEmployeeWorkingScheduleDto } from './dto/update-employee-schedule.dto';
import { EmployeeWorkingSchedulePaginationDto } from './dto/paginate.dto';

enum FindExistingTypeEnum {
  NORMAL = 'NORMAL',
  USER_INPUT_DATE = 'USER_INPUT_DATE'
}

@Injectable()
export class EmployeeWorkingScheduleService {
  constructor(
    @InjectRepository(EmployeeWorkingSchedule)
    private readonly employeeWorkingScheduleRepo: Repository<EmployeeWorkingSchedule>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
    private readonly grpcService: GrpcService,
    private readonly attendanceReportService: AttendanceReportService
  ) {}

  async findAll(paginate?: EmployeeWarningPaginationDto) {
    return GetPagination(this.employeeWorkingScheduleRepo, paginate, []);
  }

  async getWorkingScheduleForToday(): Promise<any> {
    const date = getCurrentDate().toDate();
    const data = await this.employeeWorkingScheduleRepo.find({
      where: { scheduleDate: date },
      relations: { employeeId: true }
    });

    return { data: data };
  }

  async update(data: UpdateEmployeeWorkingScheduleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updatedWorkingSchedules: EmployeeWorkingSchedule[] = [];
      for (const item of data.data) {
        const employeeWorkingSchedule =
          await this.employeeWorkingScheduleRepo.findOne({
            where: { id: item.id },
            relations: { employeeId: true }
          });

        const insertData = Object.assign(employeeWorkingSchedule, item);

        const workingSchedule = await queryRunner.manager.save(insertData);
        updatedWorkingSchedules.push(workingSchedule);
      }
      await queryRunner.commitTransaction();

      //#region Re-calculate attendance report for updated back date schedule
      for (const workingSchedule of updatedWorkingSchedules) {
        await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
          workingSchedule.employeeId.id,
          workingSchedule.scheduleDate
        );
      }
      //#endregion
    } catch (exception) {
      Logger.log(exception);
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        employeeWorkingScheduleConstraint
      );
    } finally {
      await queryRunner.release();
    }
  }

  private findExistingWorkSchedule = async (
    existingType: FindExistingTypeEnum,
    date: any,
    employeeId: number
  ) => {
    if (!isNaN(date)) {
      return await this.employeeWorkingScheduleRepo.findOne({
        where: {
          employeeId: {
            id: employeeId
          },
          scheduleDate:
            existingType === FindExistingTypeEnum.NORMAL
              ? MoreThanOrEqual(date.format(`${DEFAULT_DATE_FORMAT}`))
              : Equal(date.format(`${DEFAULT_DATE_FORMAT}`))
        },
        relations: {
          employeeId: true
        },
        select: {
          employeeId: {
            id: true
          }
        },
        order: {
          id: `DESC`
        }
      });
    }
  };

  async generateEmployeeWorkingScheduleRecord(
    generateType?: JobSchedulerLogTypeEnum,
    date?: string
  ) {
    const employees: Employee[] = await this.employeeRepo.find({
      where: {
        status: In(Object.values(EmployeeActiveStatusEnum)),
        workingShiftId: {
          workshiftType: {
            name: WorkShiftTypeEnum.ROSTER
          }
        },
        positions: {
          isMoved: false
        }
      },
      relations: {
        workingShiftId: {
          workshiftType: true
        }
      },
      select: {
        id: true,
        startDate: true,
        workingShiftId: {
          id: true,
          startWorkingTime: true,
          endWorkingTime: true
        }
      }
    });

    await this.createRecord(employees, generateType, null, date);
  }

  /**
   * This function is used to generate working schedule for employee.
   * If working shift is provided, it must be from create employee service.
   * @param employees
   * @param generateType
   * @param workingShift
   * @param date
   */
  async createRecord(
    employees: Employee[],
    generateType: JobSchedulerLogTypeEnum,
    workingShift?: WorkingShift,
    date?: string
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const genConfig = await this.grpcService.getGlobalConfigurationByName({
        name: `number-of-month-generate-working-schedule`
      });
      const currentDate: Dayjs = getCurrentDate();
      const userInputDate: Dayjs = dayJs(date).utc(true);

      for (const employee of employees) {
        // find existing schedule date by user input manual
        const existingUserInputDate: EmployeeWorkingSchedule =
          await this.findExistingWorkSchedule(
            FindExistingTypeEnum.USER_INPUT_DATE,
            userInputDate,
            employee.id
          );

        // find existing schedule date current month
        const existingWorkScheduleCurrentMonth: EmployeeWorkingSchedule =
          await this.findExistingWorkSchedule(
            FindExistingTypeEnum.NORMAL,
            currentDate,
            employee.id
          );

        // make sure schedule date of employees exist not undefine
        const existOfEmployeeScheduleDate: Date | Dayjs =
          existingWorkScheduleCurrentMonth?.scheduleDate;

        // lastMonthOfGenerateSchedule is the last schedule date of employees
        const lastMonthOfGenerateSchedule: Dayjs = dayJs(
          existOfEmployeeScheduleDate
        ).utc(true);
        // we want to know total month between current date and last generate schedule date each employee
        // why plus 1 cause we count from 0 that mean it's current of month
        // for condition exist employees schedule date
        const diffMonth: number = existOfEmployeeScheduleDate
          ? lastMonthOfGenerateSchedule.diff(currentDate, 'month') + 1
          : 0;

        // why we count number 0 or 1 cause our generate start from fist day of current month
        // so if existing that mean employee had 1 need gen start 1 = 2 months
        // if new employee mean employee schedule not found gen start 0 = 2 months
        const startGen: number =
          existOfEmployeeScheduleDate && diffMonth < Number(genConfig.value)
            ? 1
            : 0;

        const numberGenerateMonth: number = existOfEmployeeScheduleDate
          ? Number(genConfig.value) - diffMonth
          : Number(genConfig.value) - 1;

        // make sure generate correctly in current date and employee start date
        const employeeStartDate: Dayjs = dayJs(employee.startDate).utc(true);
        const isGreatThanOrEqualEmployeeStartDate: boolean =
          currentDate >= employeeStartDate;

        const firstDayOfMonth: number = currentDate.startOf('month').date(); // output first day 01
        const dayOfMonth: number = currentDate.date(); // sample 01-01-2023 output day 01

        // check condition for generate each type
        const scheduleRunManual: boolean =
          isGreatThanOrEqualEmployeeStartDate &&
          diffMonth !== Number(genConfig.value) &&
          generateType === JobSchedulerLogTypeEnum.MANUAL;

        const scheduleRunAuto: boolean =
          firstDayOfMonth === dayOfMonth &&
          diffMonth !== Number(genConfig.value) &&
          generateType === JobSchedulerLogTypeEnum.AUTO;

        const scheduleRunByUserInputDate: boolean =
          !existingUserInputDate &&
          generateType === JobSchedulerLogTypeEnum.USER_INPUT;

        if (
          scheduleRunManual ||
          scheduleRunAuto ||
          scheduleRunByUserInputDate
        ) {
          for (
            let numberGenerate: number = startGen;
            numberGenerate <= numberGenerateMonth;
            numberGenerate++
          ) {
            const scheduleDates: string[] = scheduleRunByUserInputDate
              ? this.generateWorkingScheduleDateOfMonthByUserInputDate(
                  userInputDate
                )
              : this.generateWorkingScheduleDateOfMonth(
                  dayJs(employee.startDate).utc(true),
                  firstDayOfMonth === dayOfMonth,
                  numberGenerate,
                  existOfEmployeeScheduleDate
                );

            for (const scheduleDate of scheduleDates) {
              const generateWorkingSchedule = queryRunner.manager.create(
                EmployeeWorkingSchedule,
                {
                  employeeId: {
                    id: employee.id
                  },
                  startWorkingTime:
                    workingShift?.startWorkingTime ??
                    employee.workingShiftId.startWorkingTime,
                  endWorkingTime:
                    workingShift?.endWorkingTime ??
                    employee.workingShiftId.endWorkingTime,
                  scheduleDate: scheduleDate
                }
              );
              await queryRunner.manager.save(generateWorkingSchedule);
            }
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number, paginate: EmployeeWorkingSchedulePaginationDto) {
    return this.employeeWorkingScheduleRepo.find({
      where: {
        employeeId: {
          id
        },
        ...(paginate.fromDate &&
          paginate.toDate && {
            scheduleDate: Between(paginate.fromDate, paginate.toDate)
          })
      },
      relations: {
        employeeId: true
      }
    });
  }

  private generateScheduleDate = (
    startDay: number,
    totalOfMonthGenerate: number,
    year: string | number,
    month: string | number,
    generateWorkingScheduleMonth?: string | number,
    isFirstDayOfMonth?: boolean
  ): string[] => {
    const dayOfMonths: string[] = [];
    for (let day: number = startDay; day <= totalOfMonthGenerate; day++) {
      let formattedDate: string;
      // we was compare with employee start date
      // for generate auto and click manual
      if (generateWorkingScheduleMonth) {
        formattedDate = isFirstDayOfMonth
          ? `${year}/${month}/${day}`
          : `${year}/${generateWorkingScheduleMonth}/${day}`;
      } else {
        // for generate user input date
        formattedDate = `${year}/${month}/${day}`;
      }
      dayOfMonths.push(formattedDate);
    }

    return dayOfMonths;
  };

  private generateWorkingScheduleDateOfMonth = (
    employeeStartWorkingDate: Dayjs,
    isFirstDayOfMonth: boolean, // day is 01 ?
    numberOfGenerate: number,
    lastMonthOfGenerate: Date | Dayjs
  ): string[] => {
    // why check this cause if generate from current may wrong date generate
    // example generate from current is 12-01-2023
    // add 2 months result should 12, 01 correctly
    // but we start from current 11-01-2023 result 12,01 so wrong
    const currentDateOfGenerate: Dayjs = getCurrentDate().add(
      numberOfGenerate,
      'month'
    );
    const lastDateOfEmployeeScheduleGenerate: Dayjs = dayJs(
      lastMonthOfGenerate
    ).add(numberOfGenerate, 'month');

    const currentDate = lastMonthOfGenerate
      ? lastDateOfEmployeeScheduleGenerate
      : currentDateOfGenerate;

    const currentYear: number | string = currentDate.year();
    const employeeStartDate: Dayjs = dayJs(employeeStartWorkingDate).utc(true);
    const currentDateMonth: Dayjs = currentDate.endOf('month'); // output last date of month
    const currentMonth: string | number = currentDateMonth.format(
      `${DEFAULT_MONTH_FORMAT}`
    );

    // month that need to generate working shift
    const generateWorkingScheduleMonth: string | number =
      currentDate > employeeStartDate
        ? currentDate.format(`${DEFAULT_MONTH_FORMAT}`) // output current month 10
        : employeeStartDate.format(`${DEFAULT_MONTH_FORMAT}`); // output employee start date month 10

    const totalDayOfEmpAtStartingDate: number = employeeStartDate.daysInMonth(); // output 28, 30, 31
    const totalDayCurrentDate: number = currentDate.daysInMonth(); // output 28, 30, 31

    // last day of current month sample 28, 30, 31
    const lastDayOfCurrentMonth: number =
      currentDate > employeeStartDate
        ? totalDayCurrentDate
        : totalDayOfEmpAtStartingDate;

    const totalOfMonthGenerate: number = isFirstDayOfMonth
      ? totalDayCurrentDate
      : lastDayOfCurrentMonth;

    // check employee start date
    const differenceBetweenCurrentDateAndEmpStartDate: number =
      currentDate.diff(employeeStartDate, 'day');

    const employeeStartDateDay: number =
      currentDate > employeeStartDate &&
      differenceBetweenCurrentDateAndEmpStartDate > totalDayOfEmpAtStartingDate
        ? 1
        : employeeStartDate.date();

    const startDay: number = isFirstDayOfMonth ? 1 : employeeStartDateDay;

    return this.generateScheduleDate(
      startDay,
      totalOfMonthGenerate,
      currentYear,
      currentMonth,
      generateWorkingScheduleMonth,
      isFirstDayOfMonth
    );
  };

  private generateWorkingScheduleDateOfMonthByUserInputDate = (
    userInputDate: Dayjs
  ): string[] => {
    const year: number | string = userInputDate.year();
    const startDay: number = userInputDate.date();
    const totalDaysOfMonth: number = userInputDate.daysInMonth();
    const month: string | number = userInputDate.format(
      `${DEFAULT_MONTH_FORMAT}`
    );
    return this.generateScheduleDate(startDay, totalDaysOfMonth, year, month);
  };
}
