import { Inject, Injectable } from '@nestjs/common';
import { Between, Not } from 'typeorm';
import { CurrencyEnum } from '../enum/job-scheduler-log.enum';
import { PayRollGenerationInterface } from '../interface/employee-interface';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { PAGINATION_ORDER_DIRECTION } from '../shared-resources/ts/enum/pagination-order-direction.enum';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { CompanyStructureRepository } from '../company-structure/repository/company-structure.repository';
import { ICompanyStructureRepository } from '../company-structure/repository/interface/company-structure.repository.interface';
import { ForAccountPagination } from './dto/for-account-paginate.dto';
import { PayrollReportRepository } from './repository/payroll-report.repository';
import { IPayrollReportRepository } from './repository/interface/payroll-report.repository.interface';

@Injectable()
export class SummaryPrintForAccount {
  constructor(
    @Inject(CompanyStructureRepository)
    private readonly companyStructureRepo: ICompanyStructureRepository,
    @Inject(PayrollReportRepository)
    private readonly payrollReportRepo: IPayrollReportRepository
  ) {}

  async summaryPrintForAccount(paginate: ForAccountPagination) {
    const outlets = await this.companyStructureRepo.find({
      where: {
        id: paginate.outletId,
        companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
      },
      relations: { companyStructureComponent: true }
    });

    const summaryByBank: PayRollGenerationInterface[] = [];
    const summaryByCash: PayRollGenerationInterface[] = [];

    for (const outlet of outlets) {
      const payrollByBank = await this.payrollReportRepo.find({
        where: {
          date: Between(
            dayJs(paginate.date).startOf('month').toDate(),
            dayJs(paginate.date).endOf('month').toDate()
          ),
          employee: {
            paymentMethodAccounts: {
              isDefaultAccount: true,
              paymentMethod: { name: Not(CurrencyEnum.CASH) }
            },
            positions: {
              isDefaultPosition: true,
              companyStructureOutlet: { id: outlet.id }
            }
          }
        }
      });

      const payrollByCash = await this.payrollReportRepo.find({
        where: {
          date: Between(
            dayJs(paginate.date).startOf('month').toDate(),
            dayJs(paginate.date).endOf('month').toDate()
          ),
          employee: {
            paymentMethodAccounts: {
              isDefaultAccount: true,
              paymentMethod: { name: CurrencyEnum.CASH }
            },
            positions: {
              isDefaultPosition: true,
              companyStructureOutlet: { id: outlet.id }
            }
          }
        }
      });
      let payByCash = 0;
      let payByBank = 0;
      for (const payroll of payrollByCash) {
        payByCash += Number(payroll.netTotal);
      }
      for (const payroll of payrollByBank) {
        payByBank += Number(payroll.netTotal);
      }

      summaryByCash.push({
        outlet: outlet.companyStructureComponent.name,
        qtyOfEmp: payrollByCash.length,
        totalMonthlySalaryPerOutlet: payByCash
      });

      summaryByBank.push({
        outlet: outlet.companyStructureComponent.name,
        qtyOfEmp: payrollByBank.length,
        totalMonthlySalaryPerOutlet: payByBank
      });
    }

    let propertyName: string;
    const data = {
      summaryByBank: [...summaryByBank],
      summaryByCash: [...summaryByCash]
    };

    if (
      paginate.orderBy === 'qtyOfEmp' ||
      paginate.orderBy === 'outlet' ||
      paginate.orderBy === 'totalMonthlySalaryPerOutlet'
    ) {
      propertyName = paginate.orderBy;
      data.summaryByBank = this.sortSummaryAccount(
        paginate.orderDirection,
        data,
        'summaryByBank',
        propertyName
      );
      data.summaryByCash = this.sortSummaryAccount(
        paginate.orderDirection,
        data,
        'summaryByCash',
        propertyName
      );
    }

    return data;
  }

  private sortSummaryAccount = (
    paginate: PAGINATION_ORDER_DIRECTION,
    data: any,
    property: string,
    key: any
  ) => {
    return data[property].sort((a: any, b: any) => {
      return paginate === PAGINATION_ORDER_DIRECTION.DESC
        ? b[key] - a[key]
        : a[key] - b[key];
    });
  };
}
