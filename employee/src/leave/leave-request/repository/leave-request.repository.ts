import { DataSource, In, Not, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { IPublicHolidayRepository } from '../../../../../employee/src/attendance/public-holiday/repository/interface/public-holiday.repository.interface';
import { PublicHolidayRepository } from '../../../../../employee/src/attendance/public-holiday/repository/public-holiday.repository';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { Employee } from '../../../employee/entity/employee.entity';
import { LeaveType } from '../../leave-request-type/entities/leave-type.entity';
import { LeaveTypeVariation } from '../../leave-request-type/entities/leave-type-variation.entity';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../../shared-resources/common/utils/date-utils';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../../../shared-resources/common/dto/default-date-format';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { IEmployeeRepository } from '../../../employee/repository/interface/employee.repository.interface';
import { EmployeeStatusEnum } from '../../../employee/enum/employee-status.enum';
import { ResourceNotFoundException } from '../../../shared-resources/exception';
import { LeaveRequest } from '../entities/leave-request.entity';
import { LeaveStock } from '../entities/leave-stock.entity';
import { ILeaveTypeVariationRepository } from '../../leave-request-type/repository/interface/leave-type-variation.repository.interface';
import { LeaveTypeVariationRepository } from '../../leave-request-type/repository/leave-type-variation.repository';
import { ILeaveRequestRepository } from './interface/leave-request-repository.interface';
import { LeaveStockRepository } from './leave-stock.repository';
import { ILeaveStockRepository } from './interface/leave-stock-repository.interface';

export class LeaveRequestRepository
  extends RepositoryBase<LeaveRequest>
  implements ILeaveRequestRepository
{
  private readonly LEAVE_REQUEST = 'leave request';

  private readonly leaveRequestRepository: Repository<LeaveRequest>;

  constructor(
    protected readonly dataSource: DataSource,
    @Inject(LeaveTypeVariationRepository)
    private readonly leaveTypeVariationRepo: ILeaveTypeVariationRepository,
    @Inject(LeaveStockRepository)
    private readonly leaveStockRepo: ILeaveStockRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository
  ) {
    super(dataSource.getRepository(LeaveRequest));
    this.leaveRequestRepository = dataSource.getRepository(LeaveRequest);
  }

  async generateLeaveStockForNewType(
    leaveType: LeaveType,
    date: string
  ): Promise<void> {
    const currentDate = getCurrentDateWithFormat();

    const leaveStocks = await this.leaveStockRepo.find({
      where: {
        year: dayJs(currentDate).year(),
        leaveType: { id: leaveType.id }
      },
      relations: {
        employee: true,
        leaveType: true
      },
      select: {
        leaveType: { id: true },
        employee: { id: true }
      }
    });

    const employeeIds = [];
    leaveStocks.forEach((leaveStock: LeaveStock) => {
      employeeIds.push(leaveStock.employee.id);
    });

    const whereCondition = {
      id: employeeIds.length ? Not(In(employeeIds)) : null,
      status: In([EmployeeStatusEnum.ACTIVE, EmployeeStatusEnum.IN_PROBATION]),
      positions: {
        isMoved: false
      }
    };

    const employees: Employee[] =
      await this.employeeRepo.getAllEmployeeByProvidedCondition(whereCondition);

    if (employees.length) {
      for (const employee of employees) {
        await this.generateLeaveStockForSpecificType(
          leaveType,
          employee,
          true,
          date
        );
      }
    }
  }

  async generateLeaveStockForSpecificType(
    leaveType: LeaveType,
    employee: Employee,
    isForCurrentYear: boolean,
    date: string
  ): Promise<void> {
    const carryExpire = dayJs().set('month', 1).endOf('month').toDate();

    const leaveTypeVariation: LeaveTypeVariation =
      await this.leaveTypeVariationRepo.getLeaveTypeVariationByEmployeeAndLeaveTypeId(
        employee,
        leaveType.id
      );

    if (leaveTypeVariation) {
      const stockGenerateForYear = +dayJs()
        .add(isForCurrentYear ? 0 : 1, 'year')
        .format(DEFAULT_YEAR_FORMAT);

      // check prevent duplicate leave stock
      const checkIsDuplicateEmployeeStockType: boolean =
        await this.isDuplicateEmployeeStockByLeaveTypeVariation(
          employee.id,
          leaveTypeVariation.id,
          stockGenerateForYear
        );
      if (!checkIsDuplicateEmployeeStockType) {
        let leaveDayTopUp = 0;

        //IF: no date given, take current date
        let dateTime: string = getCurrentDateWithFormat();
        if (date) {
          dateTime = date;
        }
        let totalWorkingYear = dayJs(dateTime).diff(employee.startDate, 'year');

        //GENERATE: on Jan, so add 1 month if startDate is in Jan
        if (dayJs(dateTime).month() === dayJs(employee.startDate).month()) {
          totalWorkingYear = dayJs(dateTime).diff(
            dayJs(employee.startDate)
              .set('date', 1)
              .format(DEFAULT_DATE_FORMAT),
            'year'
          );
        }

        let carryForward = 0;
        if (isForCurrentYear) {
          carryForward = await this.calculateCarryForward(leaveType, employee);

          if (leaveType.incrementRule > 0) {
            leaveDayTopUp =
              Math.floor(
                Math.floor(totalWorkingYear) / leaveType.incrementRule
              ) * leaveType.incrementAllowance;
          }
        }

        let leaveDay = leaveTypeVariation.allowancePerYear;

        if (leaveTypeVariation?.proratePerMonth) {
          leaveDay = this.calculateEmployeeLeaveDay(
            employee.startDate,
            leaveTypeVariation,
            leaveTypeVariation.proratePerMonth
          );
        }

        // if leave day is less than allowance per year, set allowance per year to equal leave day
        if (leaveDay < leaveTypeVariation.allowancePerYear) {
          leaveTypeVariation.allowancePerYear = leaveDay;
        }

        //generate public holiday stock
        if (leaveType.isPublicHoliday) {
          const publicHolidays =
            await this.publicHolidayRepo.getPublicHolidayInCurrentYear();
          leaveDay = publicHolidays.length;
          leaveTypeVariation.allowancePerYear = publicHolidays.length;
        }

        const leaveStockDto = this.leaveStockRepo.create({
          employee: { id: employee.id },
          leaveType: { id: leaveType.id },
          policyAllowancePerYear: leaveTypeVariation.allowancePerYear ?? 0,
          policyProratePerMonth: leaveTypeVariation?.proratePerMonth ?? 0,
          policyBenefitAllowanceDay:
            leaveTypeVariation?.benefitAllowanceDay ?? 0,
          policyBenefitAllowancePercentage:
            leaveTypeVariation?.benefitAllowancePercentage ?? 0,
          policySpecialLeaveAllowanceDay:
            leaveTypeVariation?.specialLeaveAllowanceDay ?? 0,
          policyCarryForwardAllowance: leaveType?.carryForwardAllowance ?? 0,
          policyCarryForwardStatus: leaveType.carryForwardStatus,
          policyIncrementAllowance: leaveType?.incrementAllowance ?? 0,
          policyIncrementRule: leaveType?.incrementRule ?? 0,
          leaveDay:
            Number(leaveDay) +
            Number(leaveTypeVariation?.specialLeaveAllowanceDay ?? 0) +
            Number(leaveDayTopUp ?? 0),
          year: stockGenerateForYear,
          carryForward: carryForward,
          carryForwardRemaining: Number(carryForward),
          actualCarryForward: Number(carryForward),
          carryForwardExpiryDate: Number(carryForward) > 0 ? carryExpire : null,
          leaveDayTopUp: leaveDayTopUp,
          specialLeaveAllowanceDay:
            leaveTypeVariation?.specialLeaveAllowanceDay ?? 0,
          leaveDayTopUpRemaining: leaveDayTopUp
        });

        await this.leaveStockRepo.save(leaveStockDto);
      }
    }
  }

  async getLeaveRequestById(id: number): Promise<LeaveRequest> {
    const leaveRequest: LeaveRequest =
      await this.leaveRequestRepository.findOne({
        where: {
          id,
          employee: {
            positions: {
              isMoved: false
            }
          }
        },
        relations: {
          employee: {
            positions: {
              companyStructurePosition: {
                positionLevelId: true
              }
            }
          },
          leaveTypeVariation: { leaveType: { coverFrom: true } },
          reasonTemplate: true
        },
        select: {
          leaveTypeVariation: {
            id: true,
            proratePerMonth: true,
            allowancePerYear: true,
            leaveType: {
              id: true,
              leaveTypeName: true,
              incrementRule: true,
              incrementAllowance: true,
              requiredDoc: true,
              carryForwardStatus: true,
              carryForwardAllowance: true,
              coverFrom: {
                id: true,
                leaveTypeName: true,
                incrementRule: true,
                incrementAllowance: true,
                requiredDoc: true,
                carryForwardStatus: true,
                carryForwardAllowance: true
              }
            }
          },
          employee: {
            id: true,
            displayFullNameEn: true,
            positions: {
              id: true,
              companyStructurePosition: {
                id: true,
                positionLevelId: {
                  id: true,
                  levelNumber: true,
                  levelTitle: true
                }
              }
            }
          },
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        }
      });

    if (!leaveRequest) {
      throw new ResourceNotFoundException(this.LEAVE_REQUEST, id);
    }

    return leaveRequest;
  }

  // ========================= [Private block function] =========================

  private async isDuplicateEmployeeStockByLeaveTypeVariation(
    employeeId: number,
    leaveTypeVariationId: number,
    stockGenerateForYear: number
  ): Promise<boolean> {
    const checkLeaveStockIsDuplicate = await this.leaveStockRepo.find({
      where: {
        employee: { id: employeeId },
        leaveType: { id: leaveTypeVariationId },
        year: stockGenerateForYear
      },
      relations: { leaveType: true, employee: true }
    });
    return checkLeaveStockIsDuplicate.length > 0;
  }

  private async calculateCarryForward(
    leaveType: LeaveType,
    employee: Employee
  ) {
    let carryForward = 0;
    if (leaveType.carryForwardStatus && leaveType.carryForwardAllowance > 0) {
      const leaveStock: LeaveStock =
        await this.getLeaveStockByLeaveTypeIdWithEmployeeId(
          leaveType.id,
          employee.id
        );

      //check leaveStock with carry forward
      if (
        Number(leaveStock?.leaveDay ?? 0) >=
        Number(leaveType.carryForwardAllowance)
      ) {
        carryForward = Number(leaveType.carryForwardAllowance);
      } else if (
        Number(leaveStock?.leaveDay ?? 0) <
        Number(leaveType.carryForwardAllowance)
      ) {
        carryForward = Number(leaveStock?.leaveDay ?? 0);
      }
    }

    return carryForward;
  }

  private async getLeaveStockByLeaveTypeIdWithEmployeeId(
    id: number,
    employeeId: number
  ): Promise<LeaveStock> {
    return await this.leaveStockRepo.findOne({
      where: { leaveType: { id }, employee: { id: employeeId } },
      relations: { leaveType: true, employee: true }
    });
  }

  private calculateEmployeeLeaveDay(
    startDate: string | Date,
    leaveTypeVariation: LeaveTypeVariation,
    policyProratePerMonth: number
  ): number {
    const currentDate = getCurrentDateWithFormat();
    const beginningOfYear = dayJs(currentDate).startOf('year').add(1, 'day');
    let workingDuration = dayJs(beginningOfYear).diff(startDate, 'month') + 1; // it counts as month. Ex: 6 months duration

    if (dayJs(startDate).isAfter(beginningOfYear)) {
      workingDuration = dayJs(startDate).diff(beginningOfYear, 'month') + 1;
    }

    if (workingDuration < 12) {
      return (12 - workingDuration + 1) * policyProratePerMonth;
    }

    return leaveTypeVariation.allowancePerYear;
  }
}
