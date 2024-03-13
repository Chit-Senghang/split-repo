import { Inject, Injectable } from '@nestjs/common';
import { Between, In } from 'typeorm';
import {
  dayJs,
  getCurrentDate
} from '../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { UtilityService } from '../utility/utility.service';
import { PayrollReportRepository } from '../payroll-generation/repository/payroll-report.repository';
import { IPayrollReportRepository } from '../payroll-generation/repository/interface/payroll-report.repository.interface';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { PaginationSeniorityDto } from './dto/paginate.dto';
import { SeniorityRepository } from './repository/seniority.repository';
import { ISeniorityRepository } from './repository/interface/seniority.repository.interface';

@Injectable()
export class SeniorityService {
  constructor(
    @Inject(SeniorityRepository)
    private readonly seniorityRepo: ISeniorityRepository,
    @Inject(PayrollReportRepository)
    private readonly payrollReportRepo: IPayrollReportRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly utilityService: UtilityService
  ) {}

  async findAll(paginate: PaginationSeniorityDto) {
    let employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      paginate.employeeId
    );
    if (paginate.outletId) {
      const employees = await this.employeeRepo.find({
        where: {
          id: In(employeeIds),
          positions: { companyStructureOutlet: { id: paginate.outletId } }
        },
        select: { id: true }
      });
      employeeIds = employees.map((employee) => employee.id);
    }

    const data = await this.seniorityRepo.findAllWithPagination(paginate, [], {
      relation: {
        employee: {
          gender: true,
          positions: {
            companyStructureCompany: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true },
            companyStructureTeam: { companyStructureComponent: true }
          }
        }
      },
      where: { employee: { id: In(employeeIds) } }
    });

    for (const input of data.data) {
      let fromDate, toDate;
      const month = dayJs(input.date).month();
      const year = dayJs(input.date).year();
      if (month > 6) {
        toDate = getCurrentDate().endOf('year').set('year', year).toDate();
        fromDate = getCurrentDate()
          .set('month', month)
          .set('year', year)
          .startOf('month')
          .toDate();
      } else {
        fromDate = getCurrentDate().startOf('year').set('year', year).toDate();
        toDate = getCurrentDate()
          .set('month', month)
          .set('year', year)
          .endOf('month')
          .toDate();
      }
      input['payrolls'] = await this.payrollReportRepo.find({
        where: {
          date: Between(fromDate, toDate),
          employee: { id: input.employee.id }
        },
        select: { date: true, totalMonthly: true }
      });

      input['workingPeriod'] =
        getCurrentDate().diff(input.employee.postProbationDate, 'months') ?? 1;
    }

    return data;
  }

  async findOne(id: number) {
    const data = await this.seniorityRepo.findOne({
      where: { id },
      relations: { employee: true }
    });

    if (!data) {
      throw new ResourceNotFoundException('Seniority', id);
    }

    return data;
  }
}
