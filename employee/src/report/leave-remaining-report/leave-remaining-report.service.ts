import { Inject, Injectable } from '@nestjs/common';
import { ILeaveTypeRepository } from '../../leave/leave-request-type/repository/interface/leave-type.repository.interface';
import { LeaveTypeRepository } from '../../leave/leave-request-type/repository/leave-type.repository';
import { UtilityService } from '../../utility/utility.service';
import { LeaveType } from '../../leave/leave-request-type/entities/leave-type.entity';
import { LeaveStockRepository } from '../../leave/leave-request/repository/leave-stock.repository';
import { ILeaveStockRepository } from '../../leave/leave-request/repository/interface/leave-stock-repository.interface';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../shared-resources/common/utils/date-utils';
import { LeaveStock } from '../../leave/leave-request/entities/leave-stock.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { ReportEnum } from '../enums/report.enum';
import { LeaveRemainingReportDto } from './dto/leave-remaining-report.dto';

@Injectable()
export class LeaveRemainingReportService {
  constructor(
    @Inject(LeaveTypeRepository)
    private readonly leaveTypeRepository: ILeaveTypeRepository,
    @Inject(LeaveStockRepository)
    private readonly leaveStockRepository: ILeaveStockRepository,
    private readonly utilityService: UtilityService
  ) {}

  async getLeaveRemainingReport(): Promise<LeaveRemainingReportDto> {
    const employee: Employee =
      await this.utilityService.getEmployeeByCurrentUser();

    if (!employee) {
      return null;
    }

    const leaveTypes: LeaveType[] = await this.leaveTypeRepository.find();

    const currentDate = getCurrentDateWithFormat();

    if (!leaveTypes.length) {
      return null;
    }

    // get leave remaining base on leave type
    const reportResponse = {};
    for (const leaveType of leaveTypes) {
      reportResponse[leaveType.leaveTypeName] =
        await this.calculateEmployeeLeaveRemainingByLeaveTypeId(
          leaveType.id,
          employee.id,
          currentDate
        );
    }

    return {
      data: {
        reportId: ReportEnum.LEAVE_REMAINING_REPORT,
        ...reportResponse
      }
    };
  }

  // =================== [Private block] ===================
  private async calculateEmployeeLeaveRemainingByLeaveTypeId(
    leaveTypeId: number,
    employeeId: number,
    dateTime: string | Date
  ): Promise<number> {
    const leaveStock =
      await this.leaveStockRepository.getEmployeeLeaveStockByLeaveTypeId(
        employeeId,
        leaveTypeId,
        dateTime,
        false
      );

    if (leaveStock) {
      // if carry forward is expired, it will return 0; otherwise, return carry forward remaining
      return (
        Number(leaveStock.leaveDay) +
        Number(this.calculateValidCarryForward(leaveStock, dateTime))
      );
    }

    return 0;
  }

  private calculateValidCarryForward(
    leaveStock: LeaveStock,
    dateTime: string | Date
  ): number {
    if (dayJs(dateTime).isAfter(leaveStock?.carryForwardExpiryDate)) {
      return 0;
    } else {
      return leaveStock?.carryForwardRemaining;
    }
  }
}
