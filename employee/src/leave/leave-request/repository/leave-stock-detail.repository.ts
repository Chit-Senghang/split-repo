import { Injectable } from '@nestjs/common';
import { Between, DataSource, QueryRunner } from 'typeorm';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { LeaveStockDetail } from '../entities/leave-stock-detail.entity';
import {
  DEFAULT_MONTH_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../../../shared-resources/common/dto/default-date-format';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { LeaveStockDetailTypeEnum } from '../enums/leave-stock-detail.enum';
import { LeaveStock } from '../entities/leave-stock.entity';
import { ILeaveStockDetailRepository } from './interface/leave-stock-detail.repository.interface';

@Injectable()
export class LeaveStockDetailRepository
  extends RepositoryBase<LeaveStockDetail>
  implements ILeaveStockDetailRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(LeaveStockDetail));
  }

  async getTotalLeaveDayByLeaveStockAndWithDate(
    leaveStockId: number,
    date: string
  ): Promise<number> {
    const month: any = dayJs(date).format(DEFAULT_MONTH_FORMAT);
    const year: any = dayJs(date).format(DEFAULT_YEAR_FORMAT);
    const leaveStockDetails = await this.find({
      where: {
        month,
        year,
        leaveStock: { id: leaveStockId }
      },
      relations: { leaveStock: true },
      select: { leaveStock: { id: true } }
    });
    let totalLeaveDayUsed = 0;
    leaveStockDetails.forEach(
      (leaveStockDetail) =>
        (totalLeaveDayUsed =
          Number(totalLeaveDayUsed) + Number(leaveStockDetail.leaveDay))
    );

    return totalLeaveDayUsed;
  }

  async getTotalProrateAllowanceFromDateToStartOfYear(
    leaveStock: LeaveStock,
    employeeId: number,
    date: string,
    queryRunner?: QueryRunner
  ): Promise<{
    totalProrateRemaining: number;
    totalProrateAllowance: number;
    carryForward: number;
  }> {
    const employee = await this.dataSource.getRepository(Employee).findOne({
      where: { id: employeeId },
      select: { id: true, startDate: true }
    });

    const startDateNotBeginningOfYear =
      dayJs(employee.startDate).isSame(date, 'year') &&
      dayJs(employee.startDate).get('month') !== 0;

    let numberOfMonths = 0;

    if (startDateNotBeginningOfYear) {
      numberOfMonths =
        dayJs(date)
          .startOf('month')
          .diff(dayJs(employee.startDate).startOf('month'), 'month') + 1;
    } else {
      numberOfMonths =
        dayJs(date)
          .startOf('month')
          .diff(dayJs(date).startOf('year'), 'month') + 1;
    }

    const totalProrateAllowance =
      numberOfMonths * Number(leaveStock.policyProratePerMonth);
    const leaveStockDetails: LeaveStockDetail[] = [];
    if (queryRunner) {
      const leaveStockDetails = await queryRunner.manager
        .getRepository(LeaveStockDetail)
        .find({
          where: {
            month: Between(1, dayJs(date).get('month') + 1),
            year: Number(dayJs(date).get('year')),
            leaveStock: { id: leaveStock.id },
            type: LeaveStockDetailTypeEnum.PRORATE
          },
          select: {
            leaveStock: { id: true }
          },
          relations: { leaveStock: true }
        });

      leaveStockDetails.push(...leaveStockDetails);
    } else {
      const leaveStockDetail = await this.find({
        where: {
          month: Between(1, dayJs(date).get('month') + 1),
          year: Number(dayJs(date).get('year')),
          leaveStock: { id: leaveStock.id },
          type: LeaveStockDetailTypeEnum.PRORATE
        },
        select: {
          leaveStock: { id: true }
        },
        relations: { leaveStock: true }
      });
      leaveStockDetails.push(...leaveStockDetail);
    }

    let totalLeaveDay = 0;
    if (leaveStockDetails.length) {
      for (const leaveStockDetail of leaveStockDetails) {
        totalLeaveDay =
          Number(totalLeaveDay) + Number(leaveStockDetail.leaveDay);
      }
    }

    return {
      totalProrateRemaining:
        Number(totalProrateAllowance) - Number(totalLeaveDay),
      totalProrateAllowance: Number(totalProrateAllowance),
      carryForward: Number(leaveStock.actualCarryForward)
    };
  }

  async getTotalLeaveDayByLeaveStockIdWithType(
    leaveStockId: number,
    year: number,
    month: number,
    type: LeaveStockDetailTypeEnum
  ): Promise<number> {
    let totalLeaveDay = 0;
    if (type === LeaveStockDetailTypeEnum.SPECIAL_LEAVE) {
      year = undefined;
      month = undefined;
    }
    const leaveStockDetails = await this.find({
      where: { leaveStock: { id: leaveStockId }, year, month, type },
      relations: { leaveStock: true },
      select: { leaveStock: { id: true } }
    });

    leaveStockDetails.forEach(
      (leaveStockDetail: LeaveStockDetail) =>
        (totalLeaveDay =
          Number(totalLeaveDay) + Number(leaveStockDetail.leaveDay))
    );

    return totalLeaveDay;
  }

  async getLeaveStockDetailByLeaveStockIdWithTypeAndDate(
    leaveStockId: number,
    date: string | Date,
    type: LeaveStockDetailTypeEnum
  ): Promise<LeaveStockDetail> {
    const month: any = dayJs(date).format(DEFAULT_MONTH_FORMAT);
    const year: any = dayJs(date).format(DEFAULT_YEAR_FORMAT);
    const existingLeaveStockDetail = await this.findOne({
      where: { leaveStock: { id: leaveStockId }, year, month, type },
      relations: { leaveStock: true },
      select: { leaveStock: { id: true } }
    });

    return existingLeaveStockDetail;
  }
}
