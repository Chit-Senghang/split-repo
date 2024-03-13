import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { LeaveTypeVariation } from '../../leave-request-type/entities/leave-type-variation.entity';
import { ResourceBadRequestException } from '../../../shared-resources/exception/badRequest.exception';
import { LeaveStock } from '../entities/leave-stock.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { ILeaveStockRepository } from './interface/leave-stock-repository.interface';

@Injectable()
export class LeaveStockRepository
  extends RepositoryBase<LeaveStock>
  implements ILeaveStockRepository
{
  private readonly LEAVE_STOCK = 'leave stock';

  private readonly LEAVE_STOCK_NOT_FOUND = 'Leave stock of employee not found.';

  private readonly leaveStockRepository: Repository<LeaveStock>;

  constructor(readonly dataSource: DataSource) {
    super(dataSource.getRepository(LeaveStock));
    this.leaveStockRepository = dataSource.getRepository(LeaveStock);
  }

  async getEmployeeLeaveStockByLeaveTypeId(
    employeeId: number,
    leaveTypeId: number,
    dateTime: string | Date,
    isValidate = true
  ): Promise<LeaveStock> {
    const leaveStock: LeaveStock | null = await this.findOne({
      where: {
        employee: { id: employeeId },
        leaveType: { id: leaveTypeId },
        year: dayJs(dateTime).year()
      },
      relations: {
        leaveType: true,
        employee: true
      }
    });

    if (!leaveStock && isValidate) {
      throw new ResourceBadRequestException(
        this.LEAVE_STOCK,
        this.LEAVE_STOCK_NOT_FOUND
      );
    }

    return leaveStock;
  }

  async getLeaveStockByLeaveRequest(
    leaveRequest: LeaveRequest
  ): Promise<LeaveStock> {
    const leaveStock: LeaveStock = await this.leaveStockRepository.findOne({
      where: {
        leaveType: { id: leaveRequest.leaveTypeVariation.id },
        employee: { id: leaveRequest.employee.id }
      },
      relations: {
        leaveType: true,
        employee: true
      }
    });

    if (!leaveStock) {
      throw new ResourceBadRequestException(
        this.LEAVE_STOCK,
        this.LEAVE_STOCK_NOT_FOUND
      );
    }

    return leaveStock;
  }

  getEmployeeLeaveStock(employeeId: number): Promise<LeaveStock> {
    employeeId;
    throw new Error('Method not implemented.');
  }

  async getLeaveStockByLeaveTypeVariation(
    leaveTypeVariation: LeaveTypeVariation,
    employeeId: number,
    dateRange: { fromDate: string; toDate: string }
  ): Promise<LeaveStock> {
    const leaveStock: LeaveStock | null =
      await this.leaveStockRepository.findOne({
        where: {
          leaveType: {
            id: leaveTypeVariation.leaveType.id
          },
          employee: { id: employeeId },
          year: dayJs(dateRange.fromDate).year()
        },
        relations: {
          leaveType: true,
          employee: true
        }
      });

    return leaveStock;
  }
}
