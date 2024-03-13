import { Inject, Injectable } from '@nestjs/common';
import { Between, In, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { LeaveTypeVariation } from '../leave-request-type/entities/leave-type-variation.entity';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../shared-resources/common/utils/date-utils';
import { Employee } from '../../employee/entity/employee.entity';
import { ResourceConflictException } from '../../shared-resources/exception/conflict-resource.exception';
import { customValidateDate } from '../../shared-resources/utils/validate-date-format';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { PublicHolidayRepository } from '../../attendance/public-holiday/repository/public-holiday.repository';
import { IPublicHolidayRepository } from '../../attendance/public-holiday/repository/interface/public-holiday.repository.interface';
import { PublicHoliday } from '../../attendance/public-holiday/entities/public-holiday.entity';
import { LeaveTypeVariationRepository } from '../leave-request-type/repository/leave-type-variation.repository';
import { ILeaveTypeVariationRepository } from '../leave-request-type/repository/interface/leave-type-variation.repository.interface';
import { LeaveRequest } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequestDurationTypeEnEnum } from './enums/leave-request-duration-type.enum';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveStock } from './entities/leave-stock.entity';
import {
  EXCEED_LIMITATION_MESSAGE,
  SPECIAL_LEAVE_EXCEED_THE_LIMIT
} from './constant/leave-request-error-messages';
import { ILeaveRequestRepository } from './repository/interface/leave-request-repository.interface';
import { ILeaveStockRepository } from './repository/interface/leave-stock-repository.interface';
import { LeaveRequestRepository } from './repository/leave-request.repository';
import { LeaveStockRepository } from './repository/leave-stock.repository';
import { ILeaveStockDetailRepository } from './repository/interface/leave-stock-detail.repository.interface';
import { LeaveStockDetailRepository } from './repository/leave-stock-detail.repository';
import { LeaveStockDetailTypeEnum } from './enums/leave-stock-detail.enum';

@Injectable()
export class LeaveRequestValidationService {
  private readonly LEAVE_TYPE_VARIATION = 'leave type variation';

  private readonly LEAVE_REQUEST = 'leave request';

  constructor(
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository,
    @Inject(LeaveTypeVariationRepository)
    private readonly leaveTypeVariationRepo: ILeaveTypeVariationRepository,
    @Inject(LeaveRequestRepository)
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    @Inject(LeaveStockRepository)
    private readonly leaveStockRepo: ILeaveStockRepository,
    @Inject(LeaveStockDetailRepository)
    private readonly leaveStockDetailRepo: ILeaveStockDetailRepository
  ) {}

  async validationLeaveRequest(
    createLeaveRequestDto: CreateLeaveRequestDto | UpdateLeaveRequestDto,
    employee: Employee,
    leaveRequestId?: number
  ): Promise<{
    leaveTypeVariation: LeaveTypeVariation;
    checkDate: { fromDate: string; toDate: string };
  }> {
    // validate given leave request type whether it exists or not
    const leaveTypeVariation: LeaveTypeVariation =
      await this.validateLeaveTypeVariationById(
        createLeaveRequestDto?.leaveRequestTypeId
      );

    // validate case leave request type is public holiday
    if (leaveTypeVariation.leaveType?.isPublicHoliday) {
      await this.validatePublicHolidayWithLeaveRequest(
        createLeaveRequestDto,
        leaveTypeVariation
      );
    }

    // validate required document when duration type is date range
    if (
      createLeaveRequestDto.durationType ===
      LeaveRequestDurationTypeEnEnum.DATE_RANGE
    ) {
      this.validateRequiredDocument(
        createLeaveRequestDto?.fromDate,
        createLeaveRequestDto.toDate,
        leaveTypeVariation.leaveType?.requiredDoc,
        createLeaveRequestDto?.documentIds
      );
    }

    const checkDate = await this.validateLeaveRequestByDuration(
      createLeaveRequestDto,
      employee,
      leaveRequestId
    );

    return { checkDate, leaveTypeVariation };
  }

  private validateRequiredDocument(
    fromDate: string | undefined,
    toDate: string | undefined,
    requiredDoc: number,
    documentIds: number[]
  ): void {
    if (requiredDoc) {
      const numberOfDay = dayJs(toDate).utc(true).diff(fromDate, 'day');
      if (requiredDoc < numberOfDay && !documentIds?.length) {
        throw new ResourceNotFoundException(
          'Document',
          'Document is required when requesting leave longer than number of day allowed.'
        );
      }
    }
  }

  async validateLeaveStock(
    employee: Employee,
    leaveTypeVariation: LeaveTypeVariation,
    createLeaveRequestDto: CreateLeaveRequestDto,
    checkDate: any
  ) {
    let leaveDay = 0.5;

    // check current leave stock of employee base on leave type variation and date
    const leaveStock =
      await this.leaveStockRepo.getEmployeeLeaveStockByLeaveTypeId(
        employee.id,
        leaveTypeVariation.leaveType.id,
        checkDate.fromDate
      );
    let totalLeaveForFirstMonth =
      await this.getTotalEmployeeLeaveRequestInMonth(
        checkDate,
        employee.id,
        createLeaveRequestDto
      );
    if (
      createLeaveRequestDto.durationType ===
      LeaveRequestDurationTypeEnEnum.DATE_RANGE
    ) {
      const isSameMonth = dayJs(checkDate.fromDate).isSame(
        checkDate.toDate,
        'month'
      );

      leaveDay = dayJs(checkDate.toDate).diff(checkDate.fromDate, 'day') + 1;

      await this.validateLeaveStockLimitation(
        leaveStock,
        leaveDay,
        createLeaveRequestDto
      );

      if (!isSameMonth) {
        const firstMonth = dayJs(
          dayJs(checkDate.fromDate).endOf('month').format(DEFAULT_DATE_FORMAT)
        ).diff(dayJs(checkDate.fromDate).subtract(1, 'day'), 'days');

        const totalAllowanceDayFirstMonth =
          await this.calculateAllowanceDayForTwoMonths(
            firstMonth,
            leaveStock,
            createLeaveRequestDto.isSpecialLeave,
            createLeaveRequestDto.fromDate
          );

        totalLeaveForFirstMonth =
          Number(totalLeaveForFirstMonth) + Number(firstMonth);

        if (totalLeaveForFirstMonth > totalAllowanceDayFirstMonth) {
          throw new ResourceConflictException(
            this.LEAVE_REQUEST,
            `You cannot request leave more than ${totalAllowanceDayFirstMonth} in the first month.`
          );
        }

        const prorateLeftFromFirstMonth =
          Number(totalAllowanceDayFirstMonth) - Number(totalLeaveForFirstMonth);

        const secondMonth = leaveDay - firstMonth;

        const leaveInSecondMonth = await this.leaveRequestRepo.find({
          where: {
            fromDate: MoreThanOrEqual(
              dayJs(createLeaveRequestDto.toDate).startOf('months').toDate()
            ),
            toDate: LessThanOrEqual(
              dayJs(createLeaveRequestDto.toDate).endOf('months').toDate()
            ),
            employee: { id: employee.id },
            leaveTypeVariation: { id: leaveTypeVariation.id }
          },
          relations: { employee: true, leaveTypeVariation: true }
        });

        let totalLeaveForSecondMonth = Number(secondMonth);
        leaveInSecondMonth.forEach((item) => {
          totalLeaveForSecondMonth =
            Number(totalLeaveForSecondMonth) + Number(item.leaveDuration);
        });

        const totalAllowanceDaySecondMonth =
          (await this.calculateLeaveDayAllowance(
            leaveStock,
            createLeaveRequestDto.isSpecialLeave,
            createLeaveRequestDto.toDate,
            true
          )) + prorateLeftFromFirstMonth;
        if (totalLeaveForSecondMonth > totalAllowanceDaySecondMonth) {
          throw new ResourceConflictException(
            this.LEAVE_REQUEST,
            `You cannot request leave more than ${totalAllowanceDaySecondMonth} in the second month.`
          );
        }

        if (
          Number(firstMonth) + Number(secondMonth) >
          Number(totalAllowanceDayFirstMonth) + Number(secondMonth)
        ) {
          throw new ResourceConflictException(
            this.LEAVE_REQUEST,
            `You cannot request leave more than ${
              Number(totalAllowanceDayFirstMonth) + Number(secondMonth)
            } in two months.`
          );
        }
      } else {
        await this.validateTotalLeaveForMonth(
          leaveStock,
          leaveDay,
          createLeaveRequestDto.isSpecialLeave,
          createLeaveRequestDto.fromDate
        );

        if (
          leaveDay > leaveStock?.leaveDay &&
          !createLeaveRequestDto.isSpecialLeave
        ) {
          throw new ResourceConflictException(
            this.LEAVE_REQUEST,
            EXCEED_LIMITATION_MESSAGE
          );
        }
      }
    } else {
      // validate leave with stock with duration type no date range
      await this.validateLeaveStockLimitation(
        leaveStock,
        leaveDay,
        createLeaveRequestDto
      );

      await this.validateTotalLeaveForMonth(
        leaveStock,
        leaveDay,
        createLeaveRequestDto.isSpecialLeave,
        createLeaveRequestDto.fromDate
      );
    }

    let isRequiredDoc = false;
    if (
      leaveStock.leaveType.requiredDoc &&
      leaveStock.leaveType.requiredDoc <= leaveDay
    ) {
      isRequiredDoc = true;

      if (!createLeaveRequestDto.documentIds?.length) {
        throw new ResourceBadRequestException(
          'document',
          'Document is required.'
        );
      }
    }

    return { leaveStock, leaveDay, isRequiredDoc };
  }

  async validateLeaveRequestByDuration(
    leaveRequestDto: CreateLeaveRequestDto | UpdateLeaveRequestDto,
    employee: Employee,
    leaveRequestId?: number
  ): Promise<{
    fromDate: string;
    toDate: string;
  }> {
    const fromDate = customValidateDate(leaveRequestDto.fromDate);
    const toDate = customValidateDate(leaveRequestDto.toDate);

    this.validateDurationType(fromDate, toDate, leaveRequestDto.durationType); // check duration type

    // check if employee already request leave or not
    await this.checkExistingEmployeeLeaveRequest(
      employee.id,
      fromDate,
      toDate,
      leaveRequestDto?.durationType,
      leaveRequestId
    );

    return { fromDate, toDate };
  }

  // ========================= [Private block function] =========================

  private async calculateAllowanceDayForTwoMonths(
    leaveDuration: number,
    leaveStock: LeaveStock,
    isSpecialLeave: boolean,
    date: string
  ) {
    let totalLeaveAllowedPerMonth = 0;
    if (leaveStock.policyProratePerMonth > 0) {
      //validate leaveDuration left with prorate
      const { totalProrateRemaining } =
        await this.leaveStockDetailRepo.getTotalProrateAllowanceFromDateToStartOfYear(
          leaveStock,
          leaveStock.employee.id,
          date
        );

      // validate special leave
      if (isSpecialLeave) {
        totalLeaveAllowedPerMonth = Number(leaveStock.specialLeaveAllowanceDay);

        if (leaveDuration >= Number(leaveStock.specialLeaveAllowanceDay)) {
          leaveStock.specialLeaveAllowanceDay = 0;
        } else {
          leaveStock.specialLeaveAllowanceDay =
            Number(leaveStock.specialLeaveAllowanceDay) - Number(leaveDuration);
        }

        return totalLeaveAllowedPerMonth;
      }

      const currentDate = getCurrentDateWithFormat();
      const validCarryForward =
        leaveStock.carryForwardRemaining > 0 &&
        dayJs(currentDate).isAfter(leaveStock.carryForwardExpiryDate);

      let carryForwardRemaining = 0;

      // validate with carry forward when carry forward is valid.
      if (validCarryForward) {
        carryForwardRemaining = Number(leaveStock.carryForwardRemaining);
        leaveDuration = this.validateLeaveDayWithCarryForward(
          leaveDuration,
          leaveStock
        );
      }

      // validate leave duration with prorate per month
      if (leaveDuration >= Number(totalProrateRemaining)) {
        leaveDuration = Number(leaveDuration) - Number(totalProrateRemaining);
      }

      totalLeaveAllowedPerMonth =
        Number(leaveStock?.leaveDayTopUpRemaining) +
        Number(carryForwardRemaining) +
        Number(totalProrateRemaining);

      // validate with top up remaining
      this.validateLeaveDurationWithTopUpRemaining(leaveDuration, leaveStock);

      return totalLeaveAllowedPerMonth;
    } else {
      return Number(leaveStock.policyAllowancePerYear);
    }
  }

  private validateLeaveDayWithCarryForward(
    leaveDuration: number,
    leaveStock: LeaveStock
  ) {
    if (Number(leaveDuration) >= Number(leaveStock.carryForwardRemaining)) {
      leaveStock.carryForwardRemaining = 0;
      leaveDuration =
        Number(leaveDuration) - Number(leaveStock.carryForwardRemaining);
    } else {
      leaveStock.carryForwardRemaining =
        Number(leaveStock.carryForwardRemaining) - Number(leaveDuration);
      leaveDuration = 0;
    }

    return leaveDuration;
  }

  private validateLeaveDurationWithTopUpRemaining(
    leaveDuration: number,
    leaveStock: LeaveStock
  ): void {
    if (
      leaveDuration > 0 &&
      Number(leaveDuration) >= Number(leaveStock.leaveDayTopUpRemaining)
    ) {
      leaveStock.leaveDayTopUpRemaining = 0;
    } else if (leaveDuration > 0) {
      leaveStock.leaveDayTopUpRemaining =
        Number(leaveStock.leaveDayTopUpRemaining) - Number(leaveDuration);
    }
  }

  private async validatePublicHolidayWithLeaveRequest(
    createLeaveRequestDto: CreateLeaveRequestDto | UpdateLeaveRequestDto,
    leaveTypeVariation: LeaveTypeVariation
  ): Promise<void> {
    const isTheSameMonth = dayJs(createLeaveRequestDto.fromDate).isSame(
      createLeaveRequestDto.toDate,
      'month'
    );

    const startOfMonth = dayJs(createLeaveRequestDto.fromDate)
      .startOf('month')
      .format(DEFAULT_DATE_FORMAT);
    const endOfMonth = dayJs(createLeaveRequestDto.toDate)
      .endOf('month')
      .format(DEFAULT_DATE_FORMAT);

    if (isTheSameMonth) {
      let totalLeaveDay =
        dayJs(createLeaveRequestDto.toDate).diff(
          createLeaveRequestDto.fromDate,
          'day'
        ) + 1; // get number of days from request date.

      const leaveRequests = await this.getLeaveEmployeeLeaveRequestByDate(
        startOfMonth,
        endOfMonth,
        createLeaveRequestDto.employeeId,
        leaveTypeVariation
      );

      let totalLeaveUsed = 0;
      leaveRequests.forEach(
        (leaveRequest: LeaveRequest) =>
          (totalLeaveUsed += Number(leaveRequest.leaveDuration))
      );

      // get public holiday in month
      const publicHolidays =
        await this.publicHolidayRepo.getPublicHolidayBetweenDates(
          createLeaveRequestDto.fromDate,
          createLeaveRequestDto.toDate
        );

      if (!publicHolidays.length) {
        throw new ResourceNotFoundException('No public holiday.');
      }

      totalLeaveDay = Number(totalLeaveDay) + Number(totalLeaveUsed);

      if (totalLeaveDay > publicHolidays.length) {
        throw new ResourceConflictException(
          this.LEAVE_REQUEST,
          `You cannot request leave more than ${publicHolidays.length} days.`
        );
      }
    } else {
      // validate public holiday for first month
      const leaveRequestsInFirstMonth =
        await this.getLeaveEmployeeLeaveRequestByDate(
          dayJs(createLeaveRequestDto.fromDate)
            .startOf('month')
            .format(DEFAULT_DATE_FORMAT),
          dayJs(createLeaveRequestDto.fromDate)
            .endOf('month')
            .format(DEFAULT_DATE_FORMAT),
          createLeaveRequestDto.employeeId,
          leaveTypeVariation
        );

      await this.validatePublicHolidayByMonth(
        createLeaveRequestDto.fromDate,
        leaveRequestsInFirstMonth
      );

      // validate public holiday for second month
      const leaveRequestsInSecondMonth =
        await this.getLeaveEmployeeLeaveRequestByDate(
          dayJs(createLeaveRequestDto.toDate)
            .startOf('month')
            .format(DEFAULT_DATE_FORMAT),
          dayJs(createLeaveRequestDto.toDate)
            .endOf('month')
            .format(DEFAULT_DATE_FORMAT),
          createLeaveRequestDto.employeeId,
          leaveTypeVariation
        );

      await this.validatePublicHolidayByMonth(
        createLeaveRequestDto.toDate,
        leaveRequestsInSecondMonth
      );
    }
  }

  private async validatePublicHolidayByMonth(
    date: string | undefined,
    leaveRequests: LeaveRequest[]
  ): Promise<void> {
    const endOfMonth = dayJs(date).endOf('month').format(DEFAULT_DATE_FORMAT);

    let totalLeaveDayUsed = dayJs(endOfMonth).diff(date, 'day') + 1;

    leaveRequests.forEach(
      (leaveRequest: LeaveRequest) =>
        (totalLeaveDayUsed += Number(leaveRequest.leaveDuration))
    );

    const publicHolidays: PublicHoliday[] | null =
      await this.publicHolidayRepo.getPublicHolidayBetweenDates(
        date,
        endOfMonth
      );

    let message = `No public holiday leave this month.`;
    if (publicHolidays.length) {
      message = `You cannot request leave more than ${publicHolidays.length} days in a month.`;
    }

    if (totalLeaveDayUsed > publicHolidays?.length) {
      throw new ResourceConflictException(this.LEAVE_REQUEST, message);
    }
  }

  private async validateLeaveTypeVariationById(
    id: number | undefined
  ): Promise<LeaveTypeVariation> {
    const leaveTypeVariation: LeaveTypeVariation | null =
      await this.leaveTypeVariationRepo.findOne({
        where: { id },
        relations: { genderId: true, leaveType: true }
      });

    if (!leaveTypeVariation) {
      throw new ResourceNotFoundException(this.LEAVE_TYPE_VARIATION, id);
    }

    return leaveTypeVariation;
  }

  private validateDurationType(
    fromDate: string,
    toDate: string,
    durationType: LeaveRequestDurationTypeEnEnum
  ) {
    const durationTypes = [
      LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY,
      LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY
    ];

    if (durationTypes.includes(durationType)) {
      if (dayJs(fromDate).diff(toDate, 'day')) {
        throw new ResourceConflictException(
          this.LEAVE_REQUEST,
          `You need to input duration from day to day`
        );
      }
    }
  }

  private async checkExistingEmployeeLeaveRequest(
    employeeId: number,
    fromDate: string,
    toDate: string,
    durationType: LeaveRequestDurationTypeEnEnum | undefined,
    leaveRequestId: number
  ) {
    let durationTypeCondition = [
      LeaveRequestDurationTypeEnEnum.DATE_RANGE,
      LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY,
      LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY
    ];

    if (durationType !== LeaveRequestDurationTypeEnEnum.DATE_RANGE) {
      durationTypeCondition = [
        LeaveRequestDurationTypeEnEnum.DATE_RANGE,
        durationType
      ];
    }

    const leaveRequest: LeaveRequest | null =
      await this.leaveRequestRepo.findOne({
        where: [
          {
            id: leaveRequestId ? Not(leaveRequestId) : null,
            employee: { id: employeeId },
            fromDate: Between(fromDate, toDate),
            durationType: In(durationTypeCondition)
          },
          {
            id: leaveRequestId ? Not(leaveRequestId) : null,
            employee: { id: employeeId },
            fromDate: MoreThanOrEqual(fromDate),
            toDate: LessThanOrEqual(toDate),
            durationType: In(durationTypeCondition)
          },
          {
            id: leaveRequestId ? Not(leaveRequestId) : null,
            employee: { id: employeeId },
            toDate: Between(fromDate, toDate),
            durationType: In(durationTypeCondition)
          }
        ],
        relations: { employee: true }
      });

    if (leaveRequest) {
      throw new ResourceConflictException(
        this.LEAVE_REQUEST,
        'You already requested leave for this day.'
      );
    }
  }

  private async getTotalEmployeeLeaveRequestInMonth(
    checkDate: any,
    employeeId: number,
    createLeaveRequestDto: CreateLeaveRequestDto
  ): Promise<number> {
    const leaveInFirstMonth = await this.leaveRequestRepo.find({
      where: {
        isSpecialLeave: createLeaveRequestDto?.isSpecialLeave ?? false,
        leaveTypeVariation: { id: createLeaveRequestDto.leaveRequestTypeId },
        fromDate: MoreThanOrEqual(
          dayJs(checkDate.fromDate).startOf('months').toDate()
        ),
        toDate: LessThanOrEqual(
          dayJs(checkDate.fromDate).endOf('months').toDate()
        ),
        employee: { id: employeeId }
      },
      relations: { employee: true, leaveTypeVariation: true }
    });

    let totalLeaveForFirstMonth = 0;
    if (leaveInFirstMonth) {
      leaveInFirstMonth.forEach((item) => {
        totalLeaveForFirstMonth =
          Number(totalLeaveForFirstMonth) + Number(item.leaveDuration);
      });
    }

    return totalLeaveForFirstMonth;
  }

  private async validateTotalLeaveForMonth(
    leaveStock: LeaveStock,
    leaveDay: number,
    isSpecialLeave: boolean,
    date: string
  ): Promise<number> {
    //get number of days allowed per month
    const allowedLeaveDay = await this.calculateLeaveDayAllowance(
      leaveStock,
      isSpecialLeave,
      date
    );

    if (allowedLeaveDay === 0) {
      throw new ResourceConflictException(
        this.LEAVE_REQUEST,
        'No more leave allowed for this month.'
      );
    }

    const EXCEED_NUMBER_OF_DAYS_ALLOWED_IN_A_MONTH = `You cannot request leave more than ${allowedLeaveDay} in a month.`;

    if (leaveDay > allowedLeaveDay) {
      throw new ResourceConflictException(
        this.LEAVE_REQUEST,
        EXCEED_NUMBER_OF_DAYS_ALLOWED_IN_A_MONTH
      );
    }

    return leaveDay;
  }

  private async calculateLeaveDayAllowance(
    leaveStock: LeaveStock,
    isSpecialLeave: boolean,
    date: string,
    isSecondMonth?: boolean
  ): Promise<number> {
    let leaveDayAllowance = 0;
    if (leaveStock.policyProratePerMonth > 0) {
      leaveDayAllowance = await this.calculateLeaveDayAllowanceDayPerMonth(
        leaveStock,
        isSpecialLeave,
        date,
        isSecondMonth
      );
    } else {
      leaveDayAllowance = leaveStock.policyAllowancePerYear;
    }

    return leaveDayAllowance;
  }

  private async calculateLeaveDayAllowanceDayPerMonth(
    leaveStock: LeaveStock,
    isSpecialLeave: boolean,
    date: string,
    isSecondMonth: boolean
  ): Promise<number> {
    let totalProrateRemaining = 0;
    if (!isSecondMonth) {
      const prorate =
        await this.leaveStockDetailRepo.getTotalProrateAllowanceFromDateToStartOfYear(
          leaveStock,
          leaveStock.employee.id,
          date
        );

      totalProrateRemaining = prorate.totalProrateRemaining;
    } else {
      const leaveStockDetail =
        await this.leaveStockDetailRepo.getLeaveStockDetailByLeaveStockIdWithTypeAndDate(
          leaveStock.id,
          date,
          LeaveStockDetailTypeEnum.PRORATE
        );

      if (leaveStockDetail) {
        totalProrateRemaining =
          Number(leaveStock.policyProratePerMonth) -
          Number(leaveStockDetail.leaveDay);
      } else {
        totalProrateRemaining = Number(leaveStock.policyProratePerMonth);
      }
    }

    if (isSpecialLeave) {
      return Number(leaveStock.specialLeaveAllowanceDay);
    }

    // if carry forward is expired, set carry forward remaining to 0
    if (dayJs().isAfter(leaveStock.carryForwardExpiryDate)) {
      leaveStock.carryForwardRemaining = 0;
    }

    return (
      Number(totalProrateRemaining) +
      Number(leaveStock.leaveDayTopUpRemaining) +
      Number(leaveStock.carryForwardRemaining)
    );
  }

  private async validateLeaveStockLimitation(
    leaveStock: LeaveStock,
    leaveDay: number,
    createLeaveRequestDto: CreateLeaveRequestDto
  ) {
    if (createLeaveRequestDto?.isSpecialLeave) {
      if (Number(leaveDay) > Number(leaveStock.specialLeaveAllowanceDay)) {
        throw new ResourceConflictException(
          this.LEAVE_REQUEST,
          Number(leaveStock.specialLeaveAllowanceDay) === 0
            ? SPECIAL_LEAVE_EXCEED_THE_LIMIT
            : `You cannot request special leave more than ${leaveStock.specialLeaveAllowanceDay} day(s)`
        );
      }
    } else if (leaveStock?.leaveDay === 0) {
      throw new ResourceConflictException(
        this.LEAVE_REQUEST,
        EXCEED_LIMITATION_MESSAGE
      );
    } else if (Number(leaveDay) > leaveStock?.leaveDay) {
      throw new ResourceConflictException(
        this.LEAVE_REQUEST,
        'Not enough leave stock.'
      );
    }
  }

  private async getLeaveEmployeeLeaveRequestByDate(
    fromDate: string | Date,
    toDate: string | Date,
    employeeId: number,
    leaveTypeVariation: LeaveTypeVariation
  ): Promise<LeaveRequest[]> {
    return await this.leaveRequestRepo.find({
      where: {
        fromDate: MoreThanOrEqual(dayJs(fromDate).startOf('months').toDate()),
        toDate: LessThanOrEqual(dayJs(toDate).endOf('months').toDate()),
        employee: { id: employeeId },
        leaveTypeVariation: { id: leaveTypeVariation.id }
      },
      relations: { employee: true, leaveTypeVariation: true }
    });
  }
}
