import * as ExcelJS from 'exceljs';
import { forEach } from 'lodash';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOperator,
  FindOptionsWhere,
  In,
  IsNull,
  MoreThanOrEqual,
  Not,
  QueryRunner,
  Raw
} from 'typeorm';
import { CurrencyEnum } from '../enum/job-scheduler-log.enum';
import {
  dayJs,
  getCurrentDate
} from '../shared-resources/common/utils/date-utils';
import { PAGINATION_ORDER_DIRECTION } from '../shared-resources/ts/enum/pagination-order-direction.enum';
import { orderByQuery } from '../shared-resources/utils/order-by-resolver.utils';
import { ResourceInternalServerError } from '../shared-resources/exception/internal-server-error.exception';
import { handleResourceConflictException } from '../shared-resources/common/utils/handle-resource-conflict-exception';
import { payrollConstraint } from '../shared-resources/ts/constants/resource-exception-constraints';
import { round } from '../shared-resources/utils/round-number';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { GrpcService } from '../grpc/grpc.service';
import { WorkShiftTypeEnum } from '../workshift-type/common/ts/enum/workshift-type.enum';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { Employee } from '../employee/entity/employee.entity';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import { PayrollDeduction } from '../payroll-deduction/entities/payroll-deduction.entity';
import { PayrollDeductionType } from '../payroll-deduction-type/entities/payroll-deduction-type.entity';
import { Seniority } from '../seniority/entities/seniority.entity';
import {
  checkIsValidYearFormat,
  convertDateRangeToFromDateToDate
} from '../shared-resources/utils/validate-date-format';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_MONTH_FORMAT,
  DEFAULT_YEAR_FORMAT,
  DEFAULT_YEAR_MONTH_FORMAT
} from '../shared-resources/common/dto/default-date-format';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { PayrollBenefitAdjustmentDetail } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment-detail.entity';
import { PayrollBenefitAdjustment } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment.entity';
import { EmployeePaymentMethodAccount } from '../employee-payment-method-account/entities/employee-payment-method-account.entity';
import { createdByMapping } from '../shared-resources/utils/mapping-user-response.util';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { UtilityService } from '../utility/utility.service';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { EmployeeStatusEnum } from '../employee/enum/employee-status.enum';
import { LeaveRequestDurationTypeEnEnum } from '../leave/leave-request/enums/leave-request-duration-type.enum';
import { AttendanceReportRepository } from '../attendance/attendance-report/repository/attendance-report.repository';
import { IAttendanceReportRepository } from '../attendance/attendance-report/repository/interface/attendance-report.repository.interface';
import { PayrollBenefitAdjustmentRepository } from '../payroll-benefit-adjustment/repository/payroll-benefit-adjustment.repository';
import { IPayrollBenefitAdjustmentRepository } from '../payroll-benefit-adjustment/repository/interface/payroll-benefit-adjustment.repository.interface';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { PayrollDeductionRepository } from '../payroll-deduction/repository/payroll-deduction.repository';
import { IPayrollDeductionRepository } from '../payroll-deduction/repository/interface/payroll-deduction.repository.interface';
import { PayrollDeductionTypeRepository } from '../payroll-deduction-type/repository/payroll-deduction-type.repository';
import { IPayrollDeductionTypeRepository } from '../payroll-deduction-type/repository/interface/payroll-deduction-type.repository.interface';
import { CompanyStructureRepository } from '../company-structure/repository/company-structure.repository';
import { ICompanyStructureRepository } from '../company-structure/repository/interface/company-structure.repository.interface';
import { PaymentMethodRepository } from '../payment-method/repository/payment-method.repository';
import { IPaymentMethodRepository } from '../payment-method/repository/interface/payment-method.repository.interface';
import { BenefitComponentRepository } from '../benefit-component/repository/benefit-component.repository';
import { IBenefitComponentRepository } from '../benefit-component/repository/interface/benefit-component.repository.interface';
import { EmployeePositionRepository } from '../employee-position/repository/employee-position.repository';
import { IEmployeePositionRepository } from '../employee-position/repository/interface/employee-position.repository.interface';
import { AttendanceReportStatusEnum } from '../attendance/attendance-report/enum/attendance-report-status.enum';
import { PayrollReportDetail } from './entities/payroll-report-detail.entity';
import { PayrollReportPaginate } from './dto/payroll-report.paginate.dto';
import { PayrollMaster } from './entities/payroll-master.entity';
import { PayrollByStore } from './entities/payroll-by-store.entity';
import { PayrollByStorePagination } from './dto/payroll-by-store-pagination.dto';
import { SummaryForAccountPagination } from './dto/summary-for-account-pagination.dto';
import { PayrollTax } from './entities/payroll-tax.entity';
import { Payroll } from './interface/payroll.interface';
import { PayrollTaxPagination } from './dto/tax-report-paginate.dto';
import { SalaryExpenseSummaryDto } from './dto/salary-expense-summary.dto';
import { mapTaxReportResponse } from './function/map-tax-report-response';
import { handleTaxReportPagination } from './function/handle-tax-report-pagination-order-by';
import { PayrollGenerationPaginationDto } from './dto/payroll-generation-pagination.dto';
import { PayrollReportForEssUserPagination } from './dto/payroll-report-for-ess.dto';
import {
  PAYROLL_REPORT_RELATIONSHIP,
  PAYROLL_REPORT_SELECTED_FIELDS
} from './constant/payroll-report-selected-fields.dto';
import { PayrollReportRepository } from './repository/payroll-report.repository';
import { IPayrollReportRepository } from './repository/interface/payroll-report.repository.interface';
import { PayrollMasterRepository } from './repository/payroll-master.repository';
import { IPayrollMasterRepository } from './repository/interface/payroll-master.repository.interface';
import { PayrollByStoreRepository } from './repository/payroll-by-store.repository';
import { IPayrollByStoreRepository } from './repository/interface/payroll-by-store.repository.interface';
import { PayrollTaxRepository } from './repository/payroll-tax.repository';
import { IPayrollTaxRepository } from './repository/interface/payroll-tax.repository.interface';
import { PayrollReport } from './entities/payroll-report.entity';
import { PaymentMethodPaginationDto } from './dto/payment-method-pagination.dto';
import { ForAccountPagination } from './dto/for-account-paginate.dto';

type DynamicComponentGrandTotal = {
  [key: string]: number;
};

@Injectable()
export class PayrollGenerationService {
  constructor(
    @Inject(AttendanceReportRepository)
    private readonly attendanceReportRepo: IAttendanceReportRepository,
    @Inject(PayrollBenefitAdjustmentRepository)
    private readonly payrollBenefitAdjustmentRepo: IPayrollBenefitAdjustmentRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(PayrollDeductionRepository)
    private readonly payrollDeductionRepo: IPayrollDeductionRepository,
    @Inject(PayrollReportRepository)
    private readonly payrollReportRepo: IPayrollReportRepository,
    @Inject(PayrollMasterRepository)
    private readonly payrollMasterRepo: IPayrollMasterRepository,
    private readonly grpcService: GrpcService,
    @Inject(PayrollDeductionTypeRepository)
    private readonly payrollDeductionTypeRepo: IPayrollDeductionTypeRepository,
    @Inject(CompanyStructureRepository)
    private readonly companyStructureRepo: ICompanyStructureRepository,
    @Inject(PaymentMethodRepository)
    private readonly paymentMethodRepo: IPaymentMethodRepository,
    @Inject(PayrollByStoreRepository)
    private readonly payrollByStoreRepo: IPayrollByStoreRepository,
    @Inject(PayrollTaxRepository)
    private readonly payrollTaxRepo: IPayrollTaxRepository,
    private readonly dataSource: DataSource,
    @Inject(BenefitComponentRepository)
    private readonly benefitComponentRepo: IBenefitComponentRepository,
    @Inject(EmployeePositionRepository)
    private readonly employeePositionRepo: IEmployeePositionRepository,
    private readonly utilityService: UtilityService
  ) {}

  async getDeductionType() {
    const deductionTypeData = await this.payrollDeductionTypeRepo.find({
      where: { isSystemDefined: true }
    });

    const deductionType = {};
    for (const item of deductionTypeData) {
      deductionType[item.name] = item.id;
    }

    return deductionType;
  }

  getDateForCreate(date?: string, payrollDate?: string) {
    const fromDate = dayJs(date)
      .subtract(1, 'months')
      .set('date', Number(payrollDate))
      .startOf('day')
      .toDate();
    const toDate = dayJs(date)
      .set('date', Number(payrollDate))
      .startOf('day')
      .toDate();

    const currentYear = dayJs(date).year();
    const currentMonth = +dayJs(date).month() + 1;
    const from = dayJs()
      .set('month', currentMonth - 5)
      .startOf('month')
      .toDate();
    const to = dayJs().endOf('month').toDate();

    return { fromDate, toDate, currentYear, currentMonth, from, to };
  }

  async getAndCalculateAttendance(
    employeeId: number,
    options: {
      fromDate: Date;
      toDate: Date;
      basicSalary: number;
      paidPerDay: number;
    }
  ) {
    const attendances = await this.attendanceReportRepo.find({
      where: {
        date: Between(options.fromDate, options.toDate),
        employee: { id: employeeId }
      },
      relations: {
        leaveRequests: { leaveTypeVariation: true }
      }
    });

    let absent = 0,
      leaveAmount = 0,
      lateScan = 0;

    for (const attendance of attendances) {
      if (attendance.status === AttendanceReportStatusEnum.ABSENT) {
        absent++;
      } else {
        for (const leave of attendance.leaveRequests) {
          if (
            leave.durationType !== LeaveRequestDurationTypeEnEnum.DATE_RANGE
          ) {
            leaveAmount +=
              options.paidPerDay -
              (options.paidPerDay *
                leave.leaveTypeVariation.benefitAllowancePercentage) /
                100;
          } else {
            leaveAmount +=
              options.paidPerDay / 2 -
              ((options.paidPerDay / 2) *
                leave.leaveTypeVariation.benefitAllowancePercentage) /
                100;
          }
        }
      }

      lateScan +=
        attendance.lateCheckIn +
        attendance.breakInEarly +
        attendance.lateBreakOut +
        attendance.checkOutEarly;
    }

    return { absent, leaveAmount, lateScan };
  }

  async create(date?: string) {
    const payrollDate = await this.grpcService.getGlobalConfigurationByName({
      name: 'payroll-generate-date'
    });

    const roundAmount = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });

    const exchangeRate = await this.grpcService.getGlobalConfigurationByName({
      name: 'exchange_rate'
    });

    const attendanceAllowance =
      await this.grpcService.getGlobalConfigurationByName({
        name: 'attendance-allowance'
      });

    const { fromDate, toDate, currentMonth, to, from } = this.getDateForCreate(
      date,
      payrollDate.value
    );

    const deductionType = await this.getDeductionType();
    const employees = await this.employeeRepo.find({
      where: {
        positions: {
          isMoved: false
        }
      },
      relations: {
        workingShiftId: { workshiftType: true },
        positions: { companyStructureOutlet: true },
        spouseId: true
      }
    });

    let grandTotal = 0;
    const totalByStore = {};
    const payrollByStore = {};
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    for (const employee of employees) {
      const payroll: Payroll = {
        employeeId: employee.id,
        benefit: 0,
        basicSalary: 0,
        deduction: 0,
        overtime: 0,
        basicSalary2: 0,
        pensionFund: 0,
        proratePerDay: 0,
        seniority: 0,
        totalMonthly: 0,
        totalMonthlyRound: 0,
        totalExcludePensionFund: 0,
        nonTaxSeniority: 0,
        netTotal: 0,
        workingDay: 0,
        salaryTaxWithHeld: 0,
        spouse: 0,
        children: 0,
        forDependent: 0,
        attendanceAllowance: 0,
        attendanceAllowanceByConfig: +attendanceAllowance.value,
        employee,
        taxPercent: 0,
        detail: []
      };

      // basic salary
      const payrollAdjustment =
        await this.getPayrollBenefitAdjustmentByEmployeeId(employee.id);

      const basicSalary = payrollAdjustment.benefitAmount;

      const paidPerDay =
        payroll?.basicSalary ??
        0 / employee.workingShiftId.workshiftType.workingDayQty;

      const { absent, lateScan, leaveAmount } =
        await this.getAndCalculateAttendance(employee.id, {
          fromDate,
          toDate,
          basicSalary: basicSalary,
          paidPerDay
        });
      const attendanceAllowanceAmount = 0;
      if (lateScan >= 60) {
        const attendanceDeductionData = queryRunner.manager.create(
          PayrollDeduction,
          {
            amount: lateScan * 0.1,
            deductionDate: toDate,
            employee: { id: employee.id },
            status: StatusEnum.ACTIVE,
            payrollDeductionType: { id: deductionType['Attendance Deduction'] }
          }
        );

        await queryRunner.manager.save(attendanceDeductionData);
      } else if (
        lateScan < 31 &&
        employee.workingShiftId.workshiftType.name ===
          WorkShiftTypeEnum.ROSTER &&
        (employee.status === EmployeeStatusEnum.ACTIVE ||
          employee.attendanceAllowanceInProbation)
      ) {
        payroll.attendanceAllowance = +attendanceAllowance.value;
      }

      if (absent || leaveAmount) {
        const attendanceDeductionData = queryRunner.manager.create(
          PayrollDeduction,
          {
            amount: absent * paidPerDay + leaveAmount,
            deductionDate: toDate,
            employee: { id: employee.id },
            status: StatusEnum.ACTIVE,
            payrollDeductionType: { id: deductionType['Leave Deduction'] }
          }
        );

        await queryRunner.manager.save(attendanceDeductionData);
      }

      //deduction
      const payrollDeductions = await queryRunner.manager.find(
        PayrollDeduction,
        {
          where: {
            employee: { id: employee.id },
            deductionDate: Between(fromDate, toDate),
            status: StatusEnum.ACTIVE
          }
        }
      );

      if (payrollDeductions.length > 0) {
        for (const payrollDeduction of payrollDeductions) {
          payroll.deduction += Number(payrollDeduction.amount);
          payroll.detail.push({
            amount: Number(payrollDeduction.amount),
            type: 'DEDUCTION',
            typeId: payrollDeduction.id
          });
        }
      }

      //benefit;
      const { benefitAmount, detail: benefitDetail } =
        await this.getPayrollBenefitAdjustmentByEmployeeId(employee.id);

      payroll.detail.push(...benefitDetail);
      payroll.proratePerDay = paidPerDay;
      payroll.basicSalary = basicSalary;
      payroll.basicSalary2 = payroll.basicSalary;
      payroll.totalMonthly =
        Number(payroll.basicSalary2) +
        payroll.attendanceAllowance +
        Number(attendanceAllowanceAmount) +
        Number(benefitAmount) -
        Number(payroll.deduction);
      payroll.totalMonthly =
        payroll.totalMonthly > 0 ? payroll.totalMonthly : 0;
      payroll.children += employee.numberOfChildren;
      if (employee.spouseId?.value === 'Wife') {
        payroll.spouse = 1;
      }

      if (currentMonth === 6 || currentMonth === 12) {
        if (employee.status === EmployeeStatusEnum.ACTIVE) {
          const { nonSeniorityTax, seniority } = await this.calculateSeniority(
            payroll,
            queryRunner,
            {
              exchangeRate: +exchangeRate.value,
              from,
              to,
              roundAmount: +roundAmount.value
            }
          );
          payroll.nonTaxSeniority = nonSeniorityTax;
          payroll.seniority = seniority;
          payroll.totalMonthly += nonSeniorityTax;
        }
      }

      payroll.totalMonthlyRound = round(
        payroll.totalMonthly,
        roundAmount.value
      );
      const { salaryAfterTax, salaryTaxWithHeld, forDependent, taxPercent } =
        this.calculateTax(
          payroll.totalMonthlyRound,
          payroll.spouse,
          payroll.children,
          +exchangeRate.value,
          +roundAmount.value
        );
      payroll.forDependent = forDependent;
      payroll.taxPercent = taxPercent;
      payroll.salaryTaxWithHeld = salaryTaxWithHeld;
      payroll.totalExcludePensionFund = payroll.totalMonthlyRound;
      payroll.netTotal = salaryAfterTax - payroll.pensionFund;

      const outLetId = employee.positions[0].companyStructureOutlet.id;
      if (payrollByStore[outLetId]) {
        payrollByStore[outLetId].push(payroll);
        totalByStore[outLetId] += payroll.netTotal;
        grandTotal += payroll.netTotal;
      } else {
        payrollByStore[outLetId] = [payroll];
        totalByStore[outLetId] = payroll.netTotal;
        grandTotal += payroll.netTotal;
      }
    }

    const stores = Object.keys(totalByStore);

    try {
      const payrollMaster = this.dataSource.manager.create(PayrollMaster, {
        date: toDate,
        total: grandTotal
      });
      const payrollMasterData =
        await this.dataSource.manager.save(payrollMaster);

      if (payrollMasterData) {
        for (const store of stores) {
          const payrollStoreDoc = this.dataSource.manager.create(
            PayrollByStore,
            {
              date: toDate,
              payrollMaster: { id: payrollMasterData.id },
              total: totalByStore[store],
              store: { id: +store }
            }
          );

          const payrollStoreStoreData =
            await this.dataSource.manager.save(payrollStoreDoc);

          if (payrollStoreStoreData) {
            for (const payroll of payrollByStore[store]) {
              await this.createPayrollReport(
                queryRunner,
                payroll,
                payrollStoreStoreData,
                {
                  currentMonth,
                  roundAmount: +roundAmount.value,
                  toDate,
                  to,
                  from,
                  exchangeRate: +exchangeRate.value
                }
              );
            }
          }
        }
      }
      await queryRunner.commitTransaction();
    } catch (exception) {
      Logger.error(exception);
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(exception, payrollConstraint);
    } finally {
      await queryRunner.release();
    }
  }

  calculateTax(
    taxableAmountUSD: number,
    spouse: number,
    children: number,
    exchangeRate = 4100,
    roundNumber = 2
  ) {
    const deductionForDependent = (spouse + children) * 150000;
    const taxableAmountKHR = taxableAmountUSD * exchangeRate;
    const taxableBasisKHR = taxableAmountKHR - deductionForDependent;
    let taxPayable = 0;
    const result = {
      salaryTaxWithHeld: 0,
      salaryAfterTax: taxableAmountUSD,
      taxPercent: 0,
      forDependent: deductionForDependent
    };
    if (taxableBasisKHR < 1500000) {
      return result;
    } else if (taxableBasisKHR < 2000000) {
      taxPayable = taxableBasisKHR * 0.05 - 75000;
      result.taxPercent = 5;
    } else if (taxableBasisKHR < 8500000) {
      taxPayable = taxableBasisKHR * 0.1 - 175000;
      result.taxPercent = 10;
    } else if (taxableBasisKHR < 12000000) {
      taxPayable = taxableBasisKHR * 0.15 - 600000;
      result.taxPercent = 15;
    } else {
      taxPayable = taxableBasisKHR * 0.2 - 1225000;
      result.taxPercent = 20;
    }
    result.salaryTaxWithHeld = round(taxPayable / exchangeRate, roundNumber);
    result.salaryAfterTax = round(
      (taxableAmountKHR - taxPayable) / exchangeRate,
      roundNumber
    );

    return result;
  }

  async createPayrollReport(
    queryRunner: QueryRunner,
    payroll: Payroll,
    payrollStoreStoreData,
    options: {
      toDate: Date;
      currentMonth: number;
      roundAmount: number;
      from: Date;
      to: Date;
      exchangeRate: number;
    }
  ) {
    const payrollDoc = this.payrollReportRepo.create({
      basicSalary: payroll.basicSalary,
      benefit: payroll.benefit,
      employee: { id: payroll.employee.id },
      deduction: payroll.deduction,
      basicSalary2: payroll.basicSalary2,
      pensionFund: payroll.pensionFund,
      nonTaxSeniority: payroll.nonTaxSeniority,
      proratePerDay: payroll.proratePerDay,
      seniority: payroll.seniority,
      totalExcludePension: payroll.totalExcludePensionFund ?? 0,
      totalMonthly: payroll.totalMonthly ?? 0,
      totalMonthlyRound: payroll.totalMonthlyRound ?? 0,
      salaryTaxWithHeld: payroll.salaryTaxWithHeld ?? 0,
      netTotal: payroll.netTotal ?? 0,
      attendanceAllowance: payroll.attendanceAllowance,
      attendanceAllowanceByConfiguration: payroll.attendanceAllowanceByConfig,
      date: options.toDate,
      payrollByStore: { id: payrollStoreStoreData.id }
    });

    const payrollReport = await queryRunner.manager.save(payrollDoc);
    const basisAmount =
      payroll.totalMonthlyRound - payroll.forDependent / options.exchangeRate;
    if (payrollReport) {
      const taxDoc = queryRunner.manager.create(PayrollTax, {
        children: payroll.children,
        payrollReport: { id: payrollDoc.id },
        basisAmount: basisAmount > 0 ? basisAmount : 0,
        forDependent: payroll.forDependent,
        percent: payroll.taxPercent,
        spouse: Boolean(payroll.spouse)
      });

      await queryRunner.manager.save(taxDoc);

      for (const payrollDetail of payroll.detail) {
        const detail = queryRunner.manager.create(PayrollReportDetail, {
          payrollReport: { id: payrollReport.id },
          amount: payrollDetail.amount,
          type: payrollDetail.type,
          typeId: payrollDetail.typeId
        });
        await queryRunner.manager.save(detail);
      }
    }
  }

  calculateSeniorityTax(totalAmount: number, exchangeRate: number) {
    const totalAmountKHR = totalAmount * exchangeRate;
    const excludeTaxAmount = 2000000;
    if (totalAmountKHR > excludeTaxAmount) {
      return {
        nonSeniorityTax: (totalAmountKHR - excludeTaxAmount) / exchangeRate,
        seniority: excludeTaxAmount / exchangeRate
      };
    }

    return {
      nonSeniorityTax: 0,
      seniority: totalAmount
    };
  }

  async calculateSeniority(
    payroll: Payroll,
    queryRunner: QueryRunner,
    options: { from: Date; to: Date; roundAmount: number; exchangeRate: number }
  ) {
    try {
      const countAttendances = await this.attendanceReportRepo.find({
        where: {
          employee: { id: payroll.employee.id },
          status: AttendanceReportStatusEnum.ABSENT,
          date: Between(options.from, options.to)
        }
      });

      if (countAttendances.length > 0) {
        const halfYearPayrolls = await this.payrollReportRepo.find({
          where: {
            employee: { id: payroll.employee.id },
            date: Between(options.from, options.to)
          }
        });

        if (halfYearPayrolls.length > 0 || payroll) {
          let avgSalary = payroll.totalMonthly;
          for (const item of halfYearPayrolls) {
            avgSalary += +item.totalMonthlyRound;
          }

          avgSalary = avgSalary / (halfYearPayrolls.length + 1);

          const avgProratePerDay = avgSalary
            ? round(
                avgSalary /
                  payroll.employee.workingShiftId.workshiftType.workingDayQty,
                options.roundAmount
              )
            : 0;
          const totalSeniority = avgProratePerDay ? avgProratePerDay * 7.5 : 0;

          const { nonSeniorityTax, seniority } = this.calculateSeniorityTax(
            totalSeniority,
            options.exchangeRate
          );

          const seniorityDoc = queryRunner.manager.create(Seniority, {
            averageTotalSalary: avgSalary,
            check: 1,
            date: options.to,
            employee: { id: payroll.employeeId },
            exchangeRate: options.exchangeRate,
            proratePerDay: avgProratePerDay,
            taxableAmountDollar: nonSeniorityTax,
            taxableAmountDollarRound: round(
              nonSeniorityTax,
              options.roundAmount
            ),
            total: seniority + nonSeniorityTax,
            totalRound: round(seniority + nonSeniorityTax, options.roundAmount)
          });

          await queryRunner.manager.save(Seniority, seniorityDoc);

          return { nonSeniorityTax, seniority };
        }
      }
    } catch (error) {
      Logger.error(error);
      await queryRunner.rollbackTransaction();
      throw new ResourceInternalServerError('Something when wrong.');
    }
  }

  convertFromDateToDate() {
    const currentDate = getCurrentDate();
    const fromDate = dayJs(currentDate)
      .utc(true)
      .startOf('month')
      .format(DEFAULT_DATE_FORMAT);
    const toDate = dayJs(currentDate)
      .utc(true)
      .endOf('month')
      .format(DEFAULT_DATE_FORMAT);

    return { fromDate, toDate };
  }

  async getPayrollBenefitAdjustmentByEmployeeId(employeeId: number) {
    const { fromDate, toDate } = this.convertFromDateToDate();
    const payrollBenefitAdjustments =
      await this.payrollBenefitAdjustmentRepo.find({
        where: [
          {
            status: StatusEnum.ACTIVE,
            employee: { id: employeeId },
            payrollBenefitAdjustmentDetail: {
              isPostProbation: false,
              effectiveDateFrom: Between(fromDate, toDate),
              effectiveDateTo: IsNull(),
              benefitComponent: {
                benefitComponentType: { name: Not('BASE SALARY') }
              }
            }
          },
          {
            status: StatusEnum.ACTIVE,
            employee: { id: employeeId },
            payrollBenefitAdjustmentDetail: {
              isPostProbation: false,
              effectiveDateFrom: Between(fromDate, toDate),
              effectiveDateTo: MoreThanOrEqual(toDate),
              benefitComponent: {
                benefitComponentType: { name: Not('BASE SALARY') }
              }
            }
          }
        ] as FindOptionsWhere<PayrollBenefitAdjustment>,
        relations: {
          employee: true,
          payrollBenefitAdjustmentDetail: {
            benefitComponent: { benefitComponentType: true }
          }
        },
        select: { employee: { id: true } }
      });

    const payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[] =
      this.combineAdjustmentDetailsOfAdjustment(payrollBenefitAdjustments);

    const uniquePayrollAdjustmentDetails: PayrollBenefitAdjustmentDetail[] =
      this.sumPayrollBenefitAdjustmentDetails(payrollBenefitAdjustmentDetails);

    return this.mappingAdjustmentDetailResponse(uniquePayrollAdjustmentDetails);
  }

  mappingAdjustmentDetailResponse = (
    uniquePayrollAdjustmentDetails: PayrollBenefitAdjustmentDetail[]
  ) => {
    let benefitAmount = 0;
    return {
      benefitAmount,
      detail: uniquePayrollAdjustmentDetails.map(
        (payrollAdjustmentDetail: PayrollBenefitAdjustmentDetail) => {
          benefitAmount += Number(payrollAdjustmentDetail.adjustAmount);
          return {
            amount: Number(payrollAdjustmentDetail?.adjustAmount),
            type: 'BENEFIT',
            typeId: payrollAdjustmentDetail.benefitComponent.id
          };
        }
      )
    };
  };

  combineAdjustmentDetailsOfAdjustment(
    payrollBenefitAdjustments: PayrollBenefitAdjustment[]
  ): PayrollBenefitAdjustmentDetail[] {
    const payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[] =
      [];

    payrollBenefitAdjustments.forEach(
      (payrollBenefitAdjustment: PayrollBenefitAdjustment) => {
        for (const payrollBenefitAdjustmentDetail of payrollBenefitAdjustment.payrollBenefitAdjustmentDetail) {
          payrollBenefitAdjustmentDetails.push(payrollBenefitAdjustmentDetail);
        }
      }
    );
    return payrollBenefitAdjustmentDetails;
  }

  sumPayrollBenefitAdjustmentDetails(
    payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[]
  ): PayrollBenefitAdjustmentDetail[] {
    const uniquePayrollAdjustmentDetails: PayrollBenefitAdjustmentDetail[] = [];
    if (payrollBenefitAdjustmentDetails.length) {
      payrollBenefitAdjustmentDetails.forEach(
        (payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail) => {
          const { duplicateBenefitComponent, benefitComponentIndex } =
            this.findDuplicateAdjustmentDetail(
              payrollBenefitAdjustmentDetail,
              uniquePayrollAdjustmentDetails
            );
          if (!duplicateBenefitComponent) {
            uniquePayrollAdjustmentDetails.push(payrollBenefitAdjustmentDetail);
          } else {
            uniquePayrollAdjustmentDetails[
              benefitComponentIndex
            ].adjustAmount += Number(duplicateBenefitComponent.adjustAmount);
          }
        }
      );
    }

    return uniquePayrollAdjustmentDetails;
  }

  findDuplicateAdjustmentDetail(
    payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail,
    uniquePayrollAdjustmentDetails: PayrollBenefitAdjustmentDetail[]
  ) {
    let benefitComponentIndex = 0;
    return {
      duplicateBenefitComponent: uniquePayrollAdjustmentDetails.find(
        (adjustmentDetail: PayrollBenefitAdjustmentDetail, index: number) => {
          benefitComponentIndex = index;
          return (
            adjustmentDetail.benefitComponent.id ===
            payrollBenefitAdjustmentDetail.benefitComponent.id
          );
        }
      ),
      benefitComponentIndex
    };
  }

  async exportPayrollMonthlyFile(
    pagination: PayrollGenerationPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.getTotalMonthly(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.PAYROLL_REPORT,
      exportFileDto,
      data
    );
  }

  async getTotalMonthly(pagination: PayrollGenerationPaginationDto) {
    let fromDate: any, toDate: any;
    if (pagination.fromDate || pagination.toDate) {
      if (!pagination.toDate || !pagination.fromDate) {
        throw new ResourceBadRequestException(
          'payroll generation',
          'fromDate and toDate are required.'
        );
      }

      if (pagination.fromDate) {
        checkIsValidYearFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
      }
      if (pagination.toDate) {
        checkIsValidYearFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
      }

      const dateRange = convertDateRangeToFromDateToDate({
        dateRange: {
          fromDate: pagination.fromDate,
          toDate: pagination.toDate
        }
      });

      fromDate = dateRange.fromDate;
      toDate = dateRange.toDate;
    }

    const data: PaginationResponse<PayrollMaster> =
      await this.payrollMasterRepo.findAllWithPagination(pagination, [], {
        where: {
          date: pagination.fromDate && Between(fromDate, toDate)
        }
      });

    if (!data.data.length) {
      return data;
    }

    let response = await Promise.all(
      data.data.map(async (payrollMaster: PayrollMaster) => {
        return {
          ...payrollMaster,
          ...(await this.mappingCreatedByResponse(payrollMaster))
        };
      })
    );

    if (pagination.orderBy) {
      response = this.handleOrderByCreatedBy(pagination, response);
    }

    return { data: response, totalCount: data.totalCount };
  }

  handleOrderByCreatedBy(
    pagination: PayrollGenerationPaginationDto,
    response: any
  ) {
    const hasOrderDirectionWithDescending =
      pagination.orderDirection &&
      pagination.orderDirection === PAGINATION_ORDER_DIRECTION.DESC;
    return response.sort((a: any, b: any) => {
      if (pagination.orderBy === 'createdBy') {
        if (hasOrderDirectionWithDescending) {
          return a.createdBy.username > b.createdBy.username ? -1 : 1;
        } else {
          return a.createdBy.username > b.createdBy.username ? 1 : -1;
        }
      } else if (pagination.orderBy === 'total') {
        if (hasOrderDirectionWithDescending) {
          return a.total > b.total ? -1 : 1;
        } else {
          return a.total > b.total ? 1 : -1;
        }
      } else if (pagination.orderBy === 'date') {
        if (hasOrderDirectionWithDescending) {
          return new Date(`${a.date}`) > new Date(`${b.date}`) ? -1 : 1;
        } else {
          return new Date(`${a.date}`) > new Date(`${b.date}`) ? 1 : -1;
        }
      } else if (pagination.orderBy === 'createdAt') {
        if (hasOrderDirectionWithDescending) {
          return new Date(`${a.createdAt}`) > new Date(`${b.createdAt}`)
            ? -1
            : 1;
        } else {
          return new Date(`${a.createdAt}`) > new Date(`${b.createdAt}`)
            ? 1
            : -1;
        }
      }
    });
  }

  async mappingCreatedByResponse(payrollMaster: PayrollMaster) {
    const user = await this.grpcService.getUserById(payrollMaster.createdBy);
    let employee: Employee;

    if (user?.isSelfService) {
      employee = await this.employeeRepo.findOne({
        where: { userId: user.id }
      });
    }

    return createdByMapping(user, employee);
  }

  async getPayrollByStore(id: number, pagination: PayrollByStorePagination) {
    const { fromDate, toDate } = convertDateRangeToFromDateToDate({
      dateRange: { fromDate: pagination.date, toDate: pagination.date }
    });
    const orderBy = orderByQuery(pagination.orderBy, pagination.orderDirection);
    const payrolls = await this.payrollReportRepo.find({
      where: {
        payrollByStore: { store: { id } },
        date: Between(dayJs(fromDate).toDate(), dayJs(toDate).toDate()),
        employee: { positions: { isDefaultPosition: true } }
      },
      relations: {
        payrollReportDetail: true,
        employee: {
          gender: true,
          positions: {
            companyStructureCompany: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true }
          }
        }
      },
      order: pagination.orderBy && orderBy,
      select: {
        payrollReportDetail: {
          id: true,
          amount: true,
          type: true,
          typeId: true
        },
        employee: {
          id: true,
          displayFullNameEn: true,
          displayFullNameKh: true,
          accountNo: true,
          dob: true,
          postProbationDate: true,
          startDate: true,
          gender: {
            id: true,
            value: true
          },
          positions: {
            id: true,
            companyStructureCompany: {
              id: true,
              companyStructureComponent: { id: true, name: true, type: true }
            },
            companyStructureLocation: {
              id: true,
              companyStructureComponent: { id: true, name: true, type: true }
            },
            companyStructureOutlet: {
              id: true,
              companyStructureComponent: { id: true, name: true, type: true }
            },
            companyStructureDepartment: {
              id: true,
              companyStructureComponent: { id: true, name: true, type: true }
            },
            companyStructureTeam: {
              id: true,
              companyStructureComponent: { id: true, name: true, type: true }
            },
            companyStructurePosition: {
              id: true,
              companyStructureComponent: { id: true, name: true, type: true }
            }
          }
        }
      }
    });
    const roundAmount = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });

    const summaryTotal = {
      totalMonthly: 0,
      totalMonthlyRound: 0,
      pensionFund: 0,
      totalMonthlyExcludePensionFund: 0,
      salaryTax: 0,
      nonTaxSeniority: 0,
      netTotal: 0
    };

    for (const payroll of payrolls) {
      summaryTotal.totalMonthly += +payroll.totalMonthly;
      summaryTotal.totalMonthlyRound += +payroll.totalMonthlyRound;
      summaryTotal.pensionFund += +payroll.pensionFund;
      summaryTotal.totalMonthlyExcludePensionFund +=
        +payroll.totalExcludePension;
      summaryTotal.salaryTax += +payroll.salaryTaxWithHeld;
      summaryTotal.nonTaxSeniority += +payroll.nonTaxSeniority;
      summaryTotal.netTotal += +payroll.netTotal;
      payroll.payrollReportDetail.sort((a, b) => {
        const nameA = a.type.toUpperCase();
        const nameB = b.type.toUpperCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      for (const detail of payroll.payrollReportDetail) {
        if (detail.type === 'BENEFIT') {
          const benefitComponent: BenefitComponent =
            await this.benefitComponentRepo.findOne({
              where: { id: detail.typeId }
            });

          if (benefitComponent) {
            detail['name'] = benefitComponent.name;
          }
        } else if (detail.type === 'DEDUCTION') {
          const temp = await this.payrollDeductionRepo.findOne({
            where: { id: detail.typeId },
            relations: { payrollDeductionType: true }
          });
          if (temp) {
            detail['name'] = temp.payrollDeductionType.name;
          }
        }
      }
      payroll.proratePerDay = round(payroll.proratePerDay, roundAmount.value);
      payroll.basicSalary2 = round(payroll.basicSalary2, roundAmount.value);
      payroll.basicSalary = round(payroll.basicSalary, roundAmount.value);
      payroll.totalMonthly = round(payroll.totalMonthly, roundAmount.value);
    }

    return { summaryTotal, data: payrolls };
  }

  async findAll(pagination: PayrollReportPaginate) {
    return this.payrollReportRepo.findAllWithPagination(pagination, [], {
      relation: { payrollReportDetail: true },
      where: {
        employee: {
          positions: {
            isMoved: false,
            isDefaultPosition: true,
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
            companyStructurePosition: {
              id: pagination.positionId
            }
          }
        }
      }
    });
  }

  async getSelfPayroll(currentDate?: string) {
    const employee = await this.employeeRepo.findOne({
      where: { id: getCurrentUserFromContext() }
    });

    if (!employee) {
      throw new ResourceNotFoundException('Not found', 'Not Found');
    }

    return this.payrollReportRepo.findOne({
      where: {
        employee: { id: employee.id },
        date: currentDate
          ? Between(
              dayJs(currentDate).startOf('month').toDate(),
              dayJs(currentDate).endOf('month').toDate()
            )
          : null
      }
    });
  }

  async findOne(id: number) {
    const payrollReport = await this.payrollReportRepo.findOne({
      where: {
        id,
        employee: { positions: { isMoved: false, isDefaultPosition: true } }
      },
      relations: {
        payrollReportDetail: true,
        employee: {
          positions: {
            companyStructurePosition: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true }
          }
        }
      },
      select: {
        employee: {
          id: true,
          firstNameEn: true,
          lastNameEn: true,
          firstNameKh: true,
          lastNameKh: true,
          displayFullNameEn: true,
          displayFullNameKh: true,
          gender: { id: true, value: true },
          accountNo: true,
          userId: true,
          positions: {
            id: true,
            isDefaultPosition: true,
            companyStructurePosition: {
              id: true,
              companyStructureComponent: {
                id: true,
                type: true,
                name: true,
                nameKh: true
              }
            },
            companyStructureOutlet: {
              id: true,
              companyStructureComponent: {
                id: true,
                type: true,
                name: true,
                nameKh: true
              }
            }
          }
        }
      }
    });

    if (!payrollReport) {
      throw new ResourceNotFoundException('Payroll Report', id);
    }

    for (const detail of payrollReport.payrollReportDetail) {
      if (detail.type === 'BENEFIT') {
        const benefitComponent = await this.benefitComponentRepo.findOne({
          where: { id: detail.typeId }
        });

        detail['name'] = benefitComponent.name;
      } else if (detail.type === 'DEDUCTION') {
        const temp = await this.payrollDeductionRepo.findOne({
          where: { id: detail.typeId },
          relations: { payrollDeductionType: true }
        });
        detail['name'] = temp?.payrollDeductionType.name;
      }
    }
    return payrollReport;
  }

  async toBankExcel(paginate: PaymentMethodPaginationDto) {
    const data = [];
    const banks: PaymentMethod[] = await this.toBank(paginate);
    banks.forEach((bank) => {
      bank.employeePaymentMethodAccount.forEach((item) => {
        data.push({
          toSalaryAccount: item.accountNumber,
          toSalaryAccountName: item.employee.displayFullNameEn,
          salaryAmount: item.employee.payrollReport[0].netTotal,
          salaryCurrency: 'USD'
        });
      });
    });

    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet('Sheet1');

    const row = worksheet.addRow([
      'toSalaryAccount',
      'toSalaryAccountName',
      'salaryAmount',
      'salaryCurrency'
    ]);

    row.eachCell((cell: ExcelJS.Cell) => {
      cell.font = {
        size: 14
      };
    });

    // Add JSON data to the worksheet
    data.forEach((row) => {
      const temp = worksheet.addRow(Object.values(row));
      temp.eachCell((cell) => {
        cell.font = {
          size: 14
        };
      });
    });

    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }
      };
      cell.font = {
        size: 10
      };
    });
    return await workbook.xlsx.writeBuffer();
  }

  async toBank(pagination: PaymentMethodPaginationDto) {
    const employeeId =
      await this.utilityService.checkCurrentUserLoginWithESSUser();
    const { fromDate, toDate }: any = convertDateRangeToFromDateToDate({
      date: pagination.date,
      type: 'month'
    });

    const orderBy = orderByQuery(pagination.orderBy, pagination.orderDirection);

    const paymentMethods = await this.paymentMethodRepo.find({
      where: {
        employeePaymentMethodAccount: {
          isDefaultAccount: true,
          paymentMethod: { id: pagination.paymentMethodId },
          employee: {
            id: In(employeeId),
            payrollReport: { date: Between(fromDate, toDate) }
          }
        }
      },
      relations: {
        employeePaymentMethodAccount: { employee: { payrollReport: true } }
      },
      order: pagination.orderBy && orderBy,
      select: {
        id: true,
        name: true,
        employeePaymentMethodAccount: {
          id: true,
          accountNumber: true,
          isDefaultAccount: true,
          employee: {
            id: true,
            displayFullNameEn: true,
            payrollReport: { id: true, netTotal: true }
          }
        }
      }
    });

    const payrolls: PaymentMethod[] = paymentMethods.map((paymentMethod) => {
      paymentMethod.employeePaymentMethodAccount.forEach(
        (item: EmployeePaymentMethodAccount) => {
          paymentMethod['total'] += Number(
            item.employee?.payrollReport[0]?.netTotal
          );
        }
      );
      return paymentMethod;
    });

    if (pagination.orderBy === 'toSalaryAmount') {
      return payrolls.sort((a: any, b: any) =>
        pagination.orderDirection === PAGINATION_ORDER_DIRECTION.DESC
          ? a.total + b.total
          : a.total - b.total
      );
    }

    return payrolls;
  }

  async forAccount(paginate: ForAccountPagination) {
    const formDate = dayJs(paginate.date).startOf('month').toDate();
    const toDate = dayJs(paginate.date).endOf('month').toDate();
    const roundNumber = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });
    const employeeId =
      await this.utilityService.checkCurrentUserLoginWithESSUser();
    let data = await this.companyStructureRepo.find({
      where: {
        ...(paginate.storeIds ? { id: In(JSON.parse(paginate.storeIds)) } : {}),
        companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET },
        ...(paginate.locationId
          ? { parentId: { id: paginate.locationId } }
          : {})
      },
      relations: {
        companyStructureComponent: true
      },
      select: {
        id: true,
        companyStructureComponent: { id: true, name: true, type: true },
        isHq: true
      }
    });

    for (const outlet of data) {
      const payroll = await this.paymentMethodRepo.find({
        where: {
          employeePaymentMethodAccount: {
            isDefaultAccount: true,
            paymentMethod: {
              id: paginate.paymentMethodId ?? null
            },
            employee: {
              id: In(employeeId),
              payrollReport: { date: Between(formDate, toDate) },
              positions: {
                isDefaultPosition: true,
                companyStructureOutlet: { id: outlet.id }
              }
            }
          }
        },
        relations: {
          employeePaymentMethodAccount: {
            employee: {
              gender: true,
              payrollReport: true,
              positions: {
                companyStructurePosition: { companyStructureComponent: true }
              }
            }
          }
        },
        select: {
          id: true,
          iBankingReportFormat: true,
          name: true,
          employeePaymentMethodAccount: {
            id: true,
            accountNumber: true,
            employee: {
              id: true,
              displayFullNameEn: true,
              displayFullNameKh: true,
              gender: { id: true, value: true },
              positions: {
                id: true,
                companyStructurePosition: {
                  id: true,
                  companyStructureComponent: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              },
              payrollReport: {
                id: true,
                totalMonthly: true,
                pensionFund: true,
                salaryTaxWithHeld: true,
                netTotal: true
              }
            }
          }
        }
      });

      outlet['banks'] = payroll.map((paymentMethod) => {
        const summary = {
          totalSalary: 0,
          salaryTax: 0,
          pensionFund: 0,
          netTotal: 0
        };

        for (const payroll of paymentMethod.employeePaymentMethodAccount) {
          summary.totalSalary +=
            +payroll.employee.payrollReport[0]?.totalMonthly;
          summary.salaryTax +=
            +payroll.employee.payrollReport[0]?.salaryTaxWithHeld || 0;
          summary.pensionFund +=
            +payroll.employee.payrollReport[0]?.pensionFund || 0;
          summary.netTotal += +payroll.employee.payrollReport[0]?.netTotal || 0;
        }

        summary.salaryTax = round(summary.salaryTax, roundNumber.value);
        summary.totalSalary = round(summary.totalSalary, roundNumber.value);
        summary.pensionFund = round(summary.pensionFund, roundNumber.value);
        summary.netTotal = round(summary.netTotal, roundNumber.value);
        paymentMethod['summary'] = summary;
        return paymentMethod;
      });
    }

    const summaryGrossAndNet =
      await this.summaryGrossSalaryAndNetSalary(paginate);

    data = data.filter((item) => item['banks'].length > 0);
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet('Sheet1');

    const row = worksheet.addRow([
      'Name',
      'Khmer Name',
      'Gender',
      'Account Number',
      'Position',
      'Outlet',
      'Total Monthly',
      'Salary Tax',
      'Pension Fund',
      'Net Total'
    ]);
    const grandTotal = await this.grandTotalForAccount(paginate);
    // Add JSON data to the worksheet
    forEach(data, (item: any) => {
      const head = worksheet.addRow([item.companyStructureComponent.name]);
      head.eachCell((cell) => {
        cell.font = {
          size: 14
        };
      });

      item.banks.forEach((bank) => {
        const head3 = worksheet.addRow([bank.name]);
        head3.eachCell((cell) => {
          cell.font = {
            size: 10
          };
        });
        bank.employeePaymentMethodAccount.forEach((account) => {
          const temp = worksheet.addRow([
            account.employee.displayFullNameEn,
            account.employee.displayFullNameKh,
            account.employee.gender.value,
            account.accountNumber,
            account.employee.positions[0].companyStructurePosition
              .companyStructureComponent.name,
            item.companyStructureComponent.name,
            account.employee.payrollReport[0].totalMonthly,
            account.employee.payrollReport[0].salaryTaxWithHeld,
            account.employee.payrollReport[0].pensionFund,
            account.employee.payrollReport[0].netTotal
          ]);

          temp.eachCell((cell) => {
            cell.font = {
              size: 7
            };
          });
        });
        const cols = worksheet.addRow([
          '',
          '',
          '',
          '',
          '',
          '',
          bank.summary.totalSalary,
          bank.summary.salaryTax,
          bank.summary.pensionFund,
          bank.summary.netTotal
        ]);
        cols.eachCell((cell) => {
          cell.font = {
            size: 7
          };
        });
        cols.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }
        };
        worksheet.addRow([]);
      });

      worksheet.addRow([]);
    });

    const cols = worksheet.addRow([
      '',
      '',
      '',
      '',
      '',
      'Grand Total',
      grandTotal.totalSalary,
      grandTotal.salaryTaxWithHeld,
      grandTotal.pensionFund,
      grandTotal.netTotal
    ]);

    cols.eachCell((cell) => {
      cell.font = {
        size: 7
      };
    });
    cols.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF0000' }
    };

    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }
      };
      cell.font = {
        size: 10
      };
    });

    const totalMonthly = worksheet.addRow(['TOTAL MONTHLY SALARY']);

    totalMonthly.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    const totalMonthlyHeader = worksheet.addRow([
      'PAYROLL BY BANK',
      '',
      '',
      '',
      `PAYROLL BY ${CurrencyEnum.CASH}`
    ]);

    totalMonthlyHeader.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    const totalMonthlyHeader2 = worksheet.addRow([
      'GROSS AMOUNT',
      'NET AMOUNT',
      '',
      '',
      'GROSS AMOUNT',
      'NET AMOUNT'
    ]);

    totalMonthlyHeader2.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    const totalMonthlyData = worksheet.addRow([
      summaryGrossAndNet.bank.grossSalary,
      summaryGrossAndNet.bank.netTotal,
      '',
      '',
      summaryGrossAndNet.cash.grossSalary,
      summaryGrossAndNet.cash.netTotal
    ]);

    totalMonthlyData.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    worksheet.addRow(['']);

    const totalMonthlyHeader3 = worksheet.addRow(['SUBTOTAL']);

    totalMonthlyHeader3.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    const totalMonthlyHeader4 = worksheet.addRow([
      'GROSS AMOUNT',
      'NET AMOUNT'
    ]);

    totalMonthlyHeader4.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    const totalMonthlyData2 = worksheet.addRow([
      summaryGrossAndNet.total.subTotal,
      summaryGrossAndNet.total.netTotal
    ]);

    totalMonthlyData2.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    totalMonthlyHeader3.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    return await workbook.xlsx.writeBuffer();
  }

  async getForAccount(paginate: ForAccountPagination) {
    const formDate = dayJs(paginate.date).startOf('month').toDate();
    const toDate = dayJs(paginate.date).endOf('month').toDate();
    const roundNumber = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });

    const employeeId =
      await this.utilityService.checkCurrentUserLoginWithESSUser();

    const outlets = await this.companyStructureRepo.find({
      where: {
        id: paginate.storeId,
        ...(paginate.locationId
          ? { parentId: { id: paginate.locationId } }
          : {}),
        companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
      },
      relations: {
        companyStructureComponent: true
      },
      select: {
        id: true,
        companyStructureComponent: { id: true, name: true, type: true },
        isHq: true
      }
    });
    for (const outlet of outlets) {
      const orderBy = orderByQuery(paginate.orderBy, paginate.orderDirection);

      const payroll = await this.paymentMethodRepo.find({
        where: {
          employeePaymentMethodAccount: {
            isDefaultAccount: true,
            paymentMethod: {
              id: paginate.paymentMethodId ?? null
            },
            employee: {
              id: In(employeeId),
              payrollReport: { date: Between(formDate, toDate) },
              positions: {
                isDefaultPosition: true,
                companyStructureOutlet: {
                  id: outlet.id
                }
              }
            }
          }
        },
        order: paginate.orderBy && orderBy,
        relations: {
          employeePaymentMethodAccount: {
            employee: {
              gender: true,
              payrollReport: true,
              positions: {
                companyStructurePosition: { companyStructureComponent: true }
              }
            }
          }
        },
        select: {
          id: true,
          iBankingReportFormat: true,
          name: true,
          employeePaymentMethodAccount: {
            id: true,
            accountNumber: true,
            employee: {
              id: true,
              accountNo: true,
              displayFullNameEn: true,
              displayFullNameKh: true,
              gender: { id: true, value: true },
              positions: {
                companyStructurePosition: {
                  id: true,
                  companyStructureComponent: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          }
        }
      });

      outlet['banks'] = payroll.map((paymentMethod) => {
        const summary = {
          totalSalary: 0,
          salaryTaxWithheld: 0,
          netTotal: 0,
          pensionFundPayByEmployee: 0,
          totalMonthlySalaryExcludePensionFund: 0,
          nonTaxSeniority: 0
        };

        for (const payroll of paymentMethod.employeePaymentMethodAccount) {
          summary.totalSalary +=
            +payroll.employee.payrollReport[0].totalMonthly;
          summary.salaryTaxWithheld +=
            +payroll.employee.payrollReport[0].salaryTaxWithHeld || 0;
          summary.pensionFundPayByEmployee +=
            +payroll.employee.payrollReport[0].pensionFund;
          summary.netTotal += +payroll.employee.payrollReport[0].netTotal;
          summary.totalMonthlySalaryExcludePensionFund +=
            +payroll.employee.payrollReport[0].totalExcludePension;
          summary.nonTaxSeniority =
            +payroll.employee.payrollReport[0].nonTaxSeniority;
        }

        summary.salaryTaxWithheld = round(
          summary.salaryTaxWithheld,
          roundNumber.value
        );
        summary.totalSalary = round(summary.totalSalary, roundNumber.value);
        summary.pensionFundPayByEmployee = round(
          summary.pensionFundPayByEmployee,
          roundNumber.value
        );
        summary.netTotal = round(summary.netTotal, roundNumber.value);
        summary.nonTaxSeniority = round(
          summary.nonTaxSeniority,
          roundNumber.value
        );
        summary.totalMonthlySalaryExcludePensionFund = round(
          summary.totalMonthlySalaryExcludePensionFund,
          roundNumber.value
        );
        paymentMethod['summary'] = summary;
        return paymentMethod;
      });
    }

    return outlets;
  }

  async getSummaryForAccount(
    outletIds: any,
    pagination: SummaryForAccountPagination
  ) {
    const newOutletIds = outletIds.includes(',')
      ? outletIds.split(',')
      : [outletIds];

    const paymentByStores = await this.payrollByStoreRepo.find({
      where: {
        store: { id: In(newOutletIds) },
        date: Between(
          dayJs(pagination.date).startOf('month').toDate(),
          dayJs(pagination.date).endOf('month').toDate()
        )
      },
      relations: {
        store: { companyStructureComponent: true },
        payrollReport: true
      }
    });

    this.handleOrderBySummaryForAccount(paymentByStores, pagination);

    return paymentByStores.map((paymentByStore: PayrollByStore) => {
      return {
        id: paymentByStore.id,
        store: {
          id: paymentByStore.store.id,
          name: paymentByStore.store?.companyStructureComponent?.name
        },
        numberOfEmployee: paymentByStore.payrollReport.length,
        total: paymentByStore.total
      };
    });
  }

  handleOrderBySummaryForAccount(
    data: any,
    pagination: SummaryForAccountPagination
  ) {
    if (pagination.orderBy && data.length) {
      const hasOrderDirectionWithDescending =
        pagination.orderDirection &&
        pagination.orderDirection === PAGINATION_ORDER_DIRECTION.DESC;
      return data.sort((a: any, b: any) => {
        if (pagination.orderBy === 'outlet') {
          if (hasOrderDirectionWithDescending) {
            return a.store.companyStructureComponent.name >
              b.store.companyStructureComponent.name
              ? -1
              : 1;
          } else {
            return a.store.companyStructureComponent.name >
              b.store.companyStructureComponent.name
              ? 1
              : -1;
          }
        } else if (pagination.orderBy === 'totalSummaryInStore') {
          if (hasOrderDirectionWithDescending) {
            return a.total > b.total ? -1 : 1;
          } else {
            return a.total > b.total ? 1 : -1;
          }
        } else if (pagination.orderBy === 'totalEmployee') {
          if (hasOrderDirectionWithDescending) {
            return a.totalEmployee > b.totalEmployee ? -1 : 1;
          } else {
            return a.totalEmployee > b.totalEmployee ? 1 : -1;
          }
        }
      });
    }

    return data;
  }

  async grandTotalForAccount(paginate: ForAccountPagination) {
    const formDate = dayJs(paginate.date).startOf('month').toDate();
    const toDate = dayJs(paginate.date).endOf('month').toDate();
    const roundNumber = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });
    const employeeId =
      await this.utilityService.checkCurrentUserLoginWithESSUser();
    const payrolls = await this.paymentMethodRepo.find({
      where: {
        employeePaymentMethodAccount: {
          isDefaultAccount: true,
          paymentMethod: {
            id: paginate.paymentMethodId ?? null
          },
          employee: {
            id: In(employeeId),
            payrollReport: { date: Between(formDate, toDate) },
            positions: {
              isDefaultPosition: true,
              ...(paginate.departmentIds
                ? {
                    companyStructureDepartment: {
                      id: In(JSON.parse(paginate.departmentIds))
                    }
                  }
                : {}),
              ...(paginate.storeIds
                ? {
                    companyStructureOutlet: {
                      id: In(JSON.parse(paginate.storeIds))
                    }
                  }
                : {}),
              ...(paginate.locationId
                ? {
                    companyStructureLocation: {
                      id: paginate.locationId
                    }
                  }
                : {})
            }
          }
        }
      },
      relations: {
        employeePaymentMethodAccount: {
          employee: {
            gender: true,
            payrollReport: true,
            positions: {
              companyStructurePosition: { companyStructureComponent: true }
            }
          }
        }
      },
      select: {
        id: true,
        iBankingReportFormat: true,
        name: true,
        employeePaymentMethodAccount: {
          id: true,
          accountNumber: true,
          employee: {
            id: true,
            displayFullNameEn: true,
            gender: { id: true, value: true },
            positions: {
              id: true,
              companyStructurePosition: {
                id: true,
                companyStructureComponent: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            },
            payrollReport: {
              id: true,
              totalMonthly: true,
              pensionFund: true,
              salaryTaxWithHeld: true,
              netTotal: true
            }
          }
        }
      }
    });

    const summary = {
      totalExcludePensionFund: 0,
      totalMonthly: 0,
      nonTaxSeniority: 0,
      totalSalary: 0,
      salaryTaxWithHeld: 0,
      pensionFund: 0,
      netTotal: 0
    };

    payrolls.forEach((payroll) => {
      payroll.employeePaymentMethodAccount.forEach((item) => {
        summary.totalSalary += +item.employee.payrollReport[0].totalMonthly;
        summary.salaryTaxWithHeld +=
          +item.employee.payrollReport[0].salaryTaxWithHeld;
        summary.pensionFund += +item.employee.payrollReport[0].pensionFund;
        summary.netTotal += +item.employee.payrollReport[0].netTotal;
        summary.totalExcludePensionFund +=
          +item.employee.payrollReport[0].totalExcludePension || 0;
        summary.nonTaxSeniority +=
          +item.employee.payrollReport[0].nonTaxSeniority || 0;
      });
    });
    summary.totalMonthly = summary.totalSalary;
    summary.totalSalary = round(summary.totalSalary, roundNumber.value);
    summary.salaryTaxWithHeld = round(
      summary.salaryTaxWithHeld,
      roundNumber.value
    );
    summary.pensionFund = round(summary.pensionFund, roundNumber.value);
    summary.netTotal = round(summary.netTotal, roundNumber.value);
    summary.totalExcludePensionFund = round(
      summary.totalExcludePensionFund,
      roundNumber.value
    );
    summary.nonTaxSeniority = round(summary.nonTaxSeniority, roundNumber.value);

    return summary;
  }

  async totalByBank(paginate: ForAccountPagination) {
    const formDate = dayJs(paginate.date).startOf('month').toDate();
    const toDate = dayJs(paginate.date).endOf('month').toDate();
    const roundNumber = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });

    const banks = await this.paymentMethodRepo.find();
    const data = {};

    for (const bank of banks) {
      const payrolls = await this.paymentMethodRepo.findOne({
        where: {
          id: bank.id,
          employeePaymentMethodAccount: {
            isDefaultAccount: true,
            employee: {
              payrollReport: { date: Between(formDate, toDate) },
              positions: {
                isDefaultPosition: true,
                ...(paginate.departmentIds
                  ? {
                      companyStructureDepartment: {
                        id: In(JSON.parse(paginate.departmentIds))
                      }
                    }
                  : {}),
                ...(paginate.storeIds
                  ? {
                      companyStructureOutlet: {
                        id: In(JSON.parse(paginate.storeIds))
                      }
                    }
                  : {}),
                ...(paginate.locationId
                  ? {
                      companyStructureLocation: {
                        id: paginate.locationId
                      }
                    }
                  : {})
              }
            }
          }
        },
        relations: {
          employeePaymentMethodAccount: {
            employee: {
              payrollReport: true
            }
          }
        },
        select: {
          id: true,
          iBankingReportFormat: true,
          name: true,
          employeePaymentMethodAccount: {
            id: true,
            accountNumber: true,
            employee: {
              id: true,
              displayFullNameEn: true,
              payrollReport: {
                id: true,
                totalMonthly: true,
                pensionFund: true,
                salaryTaxWithHeld: true,
                netTotal: true
              }
            }
          }
        }
      });

      const summary = {
        totalSalary: 0,
        salaryTaxWithHeld: 0,
        pensionFund: 0,
        netTotal: 0
      };

      if (payrolls) {
        for (const item of payrolls.employeePaymentMethodAccount) {
          summary.totalSalary += +item.employee.payrollReport[0].totalMonthly;
          summary.salaryTaxWithHeld +=
            +item.employee.payrollReport[0].salaryTaxWithHeld;
          summary.pensionFund += +item.employee.payrollReport[0].pensionFund;
          summary.netTotal += +item.employee.payrollReport[0].netTotal;
        }
      }

      summary.totalSalary = round(summary.totalSalary, roundNumber.value);
      summary.salaryTaxWithHeld = round(
        summary.salaryTaxWithHeld,
        roundNumber.value
      );
      summary.pensionFund = round(summary.pensionFund, roundNumber.value);
      summary.netTotal = round(summary.netTotal, roundNumber.value);

      data[bank.name] = summary;
    }
    return data;
  }

  async summaryTotalByCash(paginate: ForAccountPagination) {
    const formDate = dayJs(paginate.date).startOf('month').toDate();
    const toDate = dayJs(paginate.date).endOf('month').toDate();
    const roundNumber = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });
    const payrolls = await this.paymentMethodRepo.find({
      where: {
        employeePaymentMethodAccount: {
          isDefaultAccount: true,
          paymentMethod: {
            name: CurrencyEnum.CASH
          },
          employee: {
            payrollReport: { date: Between(formDate, toDate) },
            positions: {
              isDefaultPosition: true,
              ...(paginate.departmentIds
                ? {
                    companyStructureDepartment: {
                      id: In(JSON.parse(paginate.departmentIds))
                    }
                  }
                : {}),
              ...(paginate.storeIds
                ? {
                    companyStructureOutlet: {
                      id: In(JSON.parse(paginate.storeIds))
                    }
                  }
                : {}),
              ...(paginate.locationId
                ? {
                    companyStructureLocation: {
                      id: paginate.locationId
                    }
                  }
                : {})
            }
          }
        }
      },
      relations: {
        employeePaymentMethodAccount: {
          employee: {
            gender: true,
            payrollReport: true,
            positions: {
              companyStructurePosition: { companyStructureComponent: true }
            }
          }
        }
      }
    });

    const summary = {
      grossSalary: 0,
      netTotal: 0
    };

    payrolls.forEach((payroll) => {
      payroll.employeePaymentMethodAccount.forEach((item) => {
        summary.grossSalary += +item.employee.payrollReport[0].totalMonthly;
        summary.netTotal += +item.employee.payrollReport[0].netTotal;
      });
    });
    summary.grossSalary = round(summary.grossSalary, roundNumber.value);
    summary.netTotal = round(summary.netTotal, roundNumber.value);

    return summary;
  }

  async summaryTotalByBank(paginate: ForAccountPagination) {
    const formDate = dayJs(paginate.date).startOf('month').toDate();
    const toDate = dayJs(paginate.date).endOf('month').toDate();
    const roundNumber = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });
    const payrolls = await this.paymentMethodRepo.find({
      where: {
        employeePaymentMethodAccount: {
          isDefaultAccount: true,
          paymentMethod: {
            name: Not(CurrencyEnum.CASH),
            id: paginate.paymentMethodId ?? null
          },
          employee: {
            payrollReport: { date: Between(formDate, toDate) },
            positions: {
              isDefaultPosition: true,
              ...(paginate.departmentIds
                ? {
                    companyStructureDepartment: {
                      id: In(JSON.parse(paginate.departmentIds))
                    }
                  }
                : {}),
              ...(paginate.storeIds
                ? {
                    companyStructureOutlet: {
                      id: In(JSON.parse(paginate.storeIds))
                    }
                  }
                : {}),
              ...(paginate.locationId
                ? {
                    companyStructureLocation: {
                      id: paginate.locationId
                    }
                  }
                : {})
            }
          }
        }
      },
      relations: {
        employeePaymentMethodAccount: {
          employee: {
            gender: true,
            payrollReport: true,
            positions: {
              companyStructurePosition: { companyStructureComponent: true }
            }
          }
        }
      }
    });

    const summary = {
      grossSalary: 0,
      netTotal: 0
    };

    payrolls.forEach((payroll) => {
      payroll.employeePaymentMethodAccount.forEach((item) => {
        summary.grossSalary += +item.employee.payrollReport[0].totalMonthly;
        summary.netTotal += +item.employee.payrollReport[0].netTotal;
      });
    });
    summary.grossSalary = round(summary.grossSalary, roundNumber.value);
    summary.netTotal = round(summary.netTotal, roundNumber.value);

    return summary;
  }

  async summaryGrossSalaryAndNetSalary(paginate: ForAccountPagination) {
    const cash = await this.summaryTotalByCash(paginate);
    const bank = await this.summaryTotalByBank(paginate);
    const total = {
      subTotal: cash.grossSalary + bank.grossSalary,
      netTotal: cash.netTotal + bank.netTotal
    };

    return { cash, bank, total };
  }

  async taxReport(paginate: PayrollTaxPagination, yearOfMonth: string) {
    // check order column
    if (paginate.orderBy) {
      paginate.orderBy = handleTaxReportPagination(paginate.orderBy);
    }

    const paginationData = await this.payrollTaxRepo.findAllWithPagination(
      paginate,
      [],
      {
        where: {
          payrollReport: {
            date: Raw(
              (alias) =>
                `TO_CHAR(${alias}, '${DEFAULT_YEAR_MONTH_FORMAT}') = '${yearOfMonth}'`
            ),
            employee: {
              id: paginate.employeeId,
              positions: {
                isDefaultPosition: true,
                isMoved: false,
                companyStructureDepartment: {
                  id: paginate.departmentId
                },
                companyStructureLocation: {
                  id: paginate.locationId
                },
                companyStructureOutlet: {
                  id: paginate.outletId
                },
                companyStructurePosition: {
                  id: paginate.positionId
                },
                companyStructureTeam: {
                  id: paginate.teamId
                }
              }
            }
          }
        },
        relation: {
          payrollReport: {
            employee: {
              spouseId: true,
              gender: true,
              positions: {
                companyStructureOutlet: { companyStructureComponent: true },
                companyStructurePosition: { companyStructureComponent: true }
              }
            }
          }
        },
        select: {
          payrollReport: {
            id: true,
            benefit: true,
            salaryTaxWithHeld: true,
            totalExcludePension: true,
            totalMonthlyRound: true,
            employee: {
              id: true,
              accountNo: true,
              displayFullNameEn: true,
              displayFullNameKh: true,
              gender: {
                id: true,
                value: true
              },
              spouseId: {
                id: true,
                value: true
              },
              positions: {
                id: true,
                companyStructureOutlet: {
                  id: true,
                  companyStructureComponent: {
                    id: true,
                    name: true
                  }
                },
                companyStructurePosition: {
                  id: true,
                  companyStructureComponent: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    );

    // get exchange rate
    const exchangeRate = await this.grpcService.getGlobalConfigurationByName({
      name: 'exchange_rate'
    });

    // map data response with pagination
    return mapTaxReportResponse(paginationData, Number(exchangeRate.value));
  }

  async getSalaryExpenseSummary(month: number, year: number) {
    const dateTime = `${year}/${month}/01`;
    const payrollByStores: PayrollByStore[] =
      await this.getTotalMonthlySalaryLastMonth(dateTime);

    const payrollByStoreResponse: SalaryExpenseSummaryDto[] = [];

    const payrollByStoreLastMonth: PayrollByStore[] =
      await this.getTotalMonthlySalaryLastMonth(dateTime, true);

    const benefitComponents = await this.benefitComponentRepo.find();

    const dynamicComponentsLastMonthResponse = [];
    const dynamicComponentsResponse = [];
    const payrollByStoreResponseLastMonth: SalaryExpenseSummaryDto[] = [];

    for (const payrollByStore of payrollByStores) {
      const response = new SalaryExpenseSummaryDto();
      response.outletName =
        payrollByStore?.store?.companyStructureComponent?.name;
      response.numberOfStaff = payrollByStore.payrollReport.length;

      this.addValueToSummaryExpenseForCalculation(response, payrollByStore);

      //get total monthly salary last month
      if (payrollByStoreLastMonth.length) {
        const responseLastMonth = new SalaryExpenseSummaryDto();
        const payrollLastMonth =
          this.getTotalSalaryPayrollInTheSameStoreLastMonth(
            payrollByStoreLastMonth,
            payrollByStore
          );

        if (payrollLastMonth) {
          const dynamicComponentsLastMonth =
            await this.getDynamicBenefitComponent(
              payrollLastMonth.payrollReport,
              benefitComponents
            );
          dynamicComponentsLastMonthResponse.push(
            ...dynamicComponentsLastMonth
          );

          this.addValueToSummaryExpenseForCalculationLastMonth(
            payrollLastMonth,
            response,
            responseLastMonth,
            payrollByStoreResponseLastMonth
          );
        }
      }

      const benefitComponentResponse = await this.getDynamicBenefitComponent(
        payrollByStore.payrollReport,
        benefitComponents
      );

      dynamicComponentsResponse.push(...benefitComponentResponse);
      //push response of each store
      payrollByStoreResponse.push(response.init(benefitComponentResponse));
    }

    const componentResponse = {};
    this.getUniqueBenefitComponents(dynamicComponentsLastMonthResponse).forEach(
      (benefitComponent: any) => {
        if (benefitComponent) {
          componentResponse[Object.keys(benefitComponent).at(0)] =
            Object.values(benefitComponent).at(0);
        }
      }
    );

    const componentResponseCurrentMonth = {};
    this.getUniqueBenefitComponents(dynamicComponentsResponse).forEach(
      (benefitComponent: any) => {
        if (benefitComponent) {
          componentResponseCurrentMonth[Object.keys(benefitComponent).at(0)] =
            Object.values(benefitComponent).at(0);
        }
      }
    );

    //get total seniority and deduction last month
    const grandTotalLastMonth = await this.calGrandTotal(
      payrollByStoreResponseLastMonth
    );
    componentResponse['seniorityPay'] = grandTotalLastMonth.seniorityPay;
    componentResponse['totalDeduction'] = grandTotalLastMonth.deduction;

    // get total seniority pay and deduction current month
    const grandTotal = await this.calGrandTotal(payrollByStoreResponse);
    componentResponseCurrentMonth['seniorityPay'] = grandTotal.seniorityPay;
    componentResponseCurrentMonth['totalDeduction'] = grandTotal.deduction;

    const totalAmountIncreaseInDollar = this.calculateTotalAmountInDollar(
      componentResponse,
      componentResponseCurrentMonth
    );

    const totalAmountIncreaseInPercentage =
      this.calculateTotalAmountInPercentage(
        componentResponse,
        componentResponseCurrentMonth
      );

    return {
      salaryExpenseSummary: payrollByStoreResponse,
      grandTotal: grandTotal,
      lastMonthTotalAmount: Object.keys(componentResponse).length
        ? componentResponse
        : null,
      totalAmount: Object.keys(componentResponseCurrentMonth).length
        ? componentResponseCurrentMonth
        : null,
      totalAmountIncreaseInDollar,
      totalAmountIncreaseInPercentage
    };
  }

  addValueToSummaryExpenseForCalculationLastMonth(
    payrollLastMonth: PayrollByStore,
    response: SalaryExpenseSummaryDto,
    responseLastMonth: SalaryExpenseSummaryDto,
    payrollByStoreResponseLastMonth: any
  ) {
    const additionalBonusLastMonth = this.calTotalValueInStoreBaseOneColumnName(
      payrollLastMonth.payrollReport,
      'benefit'
    );

    const basicSalaryLastMonth = this.calTotalValueInStoreBaseOneColumnName(
      payrollLastMonth.payrollReport,
      'basicSalary'
    );

    response.totalMonthlySalaryLastMonth =
      this.calTotalValueInStoreBaseOneColumnName(
        payrollLastMonth?.payrollReport,
        'totalMonthlyRound'
      );

    responseLastMonth.seniorityPay = this.calTotalValueInStoreBaseOneColumnName(
      payrollLastMonth?.payrollReport,
      'seniorityPay'
    );

    responseLastMonth.totalDeduction =
      this.calTotalValueInStoreBaseOneColumnName(
        payrollLastMonth?.payrollReport,
        'deduction'
      );

    response.totalFixedMonthlySalaryLastMonth =
      Number(basicSalaryLastMonth) + Number(additionalBonusLastMonth);
    payrollByStoreResponseLastMonth.push(responseLastMonth);
  }

  addValueToSummaryExpenseForCalculation(
    response: SalaryExpenseSummaryDto,
    payrollByStore: PayrollByStore
  ) {
    response.totalDeduction = this.calTotalValueInStoreBaseOneColumnName(
      payrollByStore.payrollReport,
      'deduction'
    );

    response.basicSalary = this.calTotalValueInStoreBaseOneColumnName(
      payrollByStore.payrollReport,
      'basicSalary'
    );

    response.seniorityPay = this.calTotalValueInStoreBaseOneColumnName(
      payrollByStore.payrollReport,
      'seniority'
    );

    response.pensionFundPayByEmployees =
      this.calTotalValueInStoreBaseOneColumnName(
        payrollByStore.payrollReport,
        'pensionFund'
      );

    response.salaryTaxWithHeldUSD = this.calTotalValueInStoreBaseOneColumnName(
      payrollByStore.payrollReport,
      'salaryTaxWithHeld'
    );

    response.nonTaxSeniority = this.calTotalValueInStoreBaseOneColumnName(
      payrollByStore.payrollReport,
      'nonTaxSeniority'
    );

    response.totalMonthlySalary = this.calTotalValueInStoreBaseOneColumnName(
      payrollByStore.payrollReport,
      'totalMonthlyRound'
    );

    response.netTotalMonthlySalary = this.calTotalValueInStoreBaseOneColumnName(
      payrollByStore.payrollReport,
      'netTotal'
    );
  }

  calculateTotalAmountInPercentage(
    componentResponse: any,
    componentResponseCurrentMonth: any
  ) {
    const totalAmountIncreaseInDollar = {};
    if (Object.keys(componentResponse).length) {
      if (Object.keys(componentResponseCurrentMonth).length) {
        if (
          Object.keys(componentResponseCurrentMonth).length >
          Object.keys(componentResponse).length
        ) {
          for (const [key, value] of Object.entries(
            componentResponseCurrentMonth
          )) {
            totalAmountIncreaseInDollar[key] =
              Number(value) / Number(componentResponseCurrentMonth[key]) || 0;
          }
        } else {
          for (const [key, value] of Object.entries(componentResponse)) {
            totalAmountIncreaseInDollar[key] =
              Number(value) / Number(componentResponseCurrentMonth[key]) || 0;
          }
        }
      } else {
        for (const [key] of Object.entries(componentResponse)) {
          totalAmountIncreaseInDollar[key] = -100;
        }
      }
    } else if (Object.keys(componentResponseCurrentMonth).length) {
      for (const [key] of Object.entries(componentResponseCurrentMonth)) {
        totalAmountIncreaseInDollar[key] = 0;
      }
    }

    return Object.keys(totalAmountIncreaseInDollar).length
      ? totalAmountIncreaseInDollar
      : null;
  }

  calculateTotalAmountInDollar(
    componentResponse: any,
    componentResponseCurrentMonth: any
  ) {
    let totalAmountIncreaseInDollar = {};
    if (Object.keys(componentResponse).length) {
      if (Object.keys(componentResponseCurrentMonth).length) {
        if (
          Object.keys(componentResponseCurrentMonth).length >
          Object.keys(componentResponse).length
        ) {
          for (const [key, value] of Object.entries(
            componentResponseCurrentMonth
          )) {
            totalAmountIncreaseInDollar[key] =
              Number(value) - Number(componentResponseCurrentMonth[key]);
          }
        } else {
          for (const [key, value] of Object.entries(componentResponse)) {
            totalAmountIncreaseInDollar[key] =
              Number(value) - Number(componentResponseCurrentMonth[key]);
          }
        }
      } else {
        totalAmountIncreaseInDollar = componentResponse;
      }
    }

    return Object.keys(totalAmountIncreaseInDollar).length
      ? totalAmountIncreaseInDollar
      : null;
  }

  async getDynamicBenefitComponent(
    payrollReports: PayrollReport[],
    benefitComponents: BenefitComponent[]
  ) {
    const components = [];

    for (const payrollReport of payrollReports) {
      components.push(
        await this.mappingEmployeePayrollBenefit(
          payrollReport?.payrollReportDetail,
          benefitComponents
        )
      );
    }

    const allBenefitComponent = [];
    components.forEach((element: any) => {
      if (element) {
        for (const [key, value] of Object.entries(element)) {
          allBenefitComponent.push({ [key]: Number(value) });
        }
      }
    });

    return this.getUniqueBenefitComponents(allBenefitComponent);
  }

  getUniqueBenefitComponents(benefitComponents: any) {
    const unique = [];
    benefitComponents.forEach((element: any) => {
      const duplicate: any = unique.find((item: any, index: number) => {
        if (item) {
          unique[index][Object.keys(item).at(0)] =
            Number(Object.values(item).at(0)) +
            Number(Object.values(element).at(0));
          return Object.keys(item).at(0) === Object.keys(element).at(0);
        }
      });

      if (!duplicate) {
        unique.push(element);
      }
    });

    return unique.filter((element: any) => element);
  }

  async calculateDynamicBenefitComponents(
    payrollByStoreMaster: DynamicComponentGrandTotal
  ): Promise<BenefitComponent[]> {
    const benefitComponents = await this.benefitComponentRepo.find();
    benefitComponents.forEach((benefitComponent: BenefitComponent) => {
      payrollByStoreMaster[benefitComponent.name] = 0;
    });

    return benefitComponents;
  }

  async calGrandTotal(payrollByStoreResponse: SalaryExpenseSummaryDto[]) {
    const payrollByStoreMaster: DynamicComponentGrandTotal = {
      numberOfEmployees: 0,
      baseSalary: 0,
      additionalBonus: 0,
      fixedSalary: 0,
      seniorityPay: 0,
      deduction: 0,
      monthlySalary: 0,
      pensionFundPayByEmployees: 0,
      salaryTaxWithHeldUSD: 0,
      nonTaxSeniorityPay: 0,
      netTotalMonthlySalary: 0,
      monthlySalaryLastMonth: 0,
      amountIncreaseInDollar: 0,
      amountIncreaseInPercentage: 0,
      fixedSalaryLastMonth: 0,
      fixedAmountInDollar: 0,
      fixedAmountIncreaseInPercentage: 0
    };

    const benefitComponents =
      await this.calculateDynamicBenefitComponents(payrollByStoreMaster);

    payrollByStoreResponse.forEach(
      (payrollByStoreResponse: SalaryExpenseSummaryDto) => {
        payrollByStoreMaster.numberOfEmployees =
          Number(payrollByStoreMaster.numberOfEmployees) +
          Number(payrollByStoreResponse.numberOfStaff);
        payrollByStoreMaster.baseSalary =
          Number(payrollByStoreMaster.baseSalary) +
          Number(payrollByStoreResponse.basicSalary);
        payrollByStoreMaster.additionalBonus =
          Number(payrollByStoreMaster.additionalBonus) +
          Number(payrollByStoreResponse.additionalBonus);
        payrollByStoreMaster.fixedSalary =
          Number(payrollByStoreMaster.fixedSalary) +
          Number(payrollByStoreResponse.totalFixedSalary);
        payrollByStoreMaster.seniorityPay =
          Number(payrollByStoreMaster.seniorityPay) +
          Number(payrollByStoreResponse.seniorityPay);
        payrollByStoreMaster.deduction =
          Number(payrollByStoreMaster.deduction) +
          Number(payrollByStoreResponse.totalDeduction);
        payrollByStoreMaster.monthlySalary =
          Number(payrollByStoreMaster.monthlySalary) +
          Number(payrollByStoreResponse.totalMonthlySalary);
        payrollByStoreMaster.pensionFundPayByEmployees =
          Number(payrollByStoreMaster.pensionFundPayByEmployees) +
          Number(payrollByStoreResponse.pensionFundPayByEmployees);
        payrollByStoreMaster.salaryTaxWithHeldUSD =
          Number(payrollByStoreMaster.salaryTaxWithHeldUSD) +
          Number(payrollByStoreResponse.salaryTaxWithHeldUSD);
        payrollByStoreMaster.nonTaxSeniorityPay =
          Number(payrollByStoreMaster.nonTaxSeniorityPay) +
          Number(payrollByStoreResponse.nonTaxSeniority);
        payrollByStoreMaster.netTotalMonthlySalary =
          Number(payrollByStoreMaster.netTotalMonthlySalary) +
          Number(payrollByStoreResponse.netTotalMonthlySalary);
        payrollByStoreMaster.monthlySalaryLastMonth =
          Number(payrollByStoreMaster.monthlySalaryLastMonth) +
          Number(payrollByStoreResponse.totalMonthlySalaryLastMonth);
        payrollByStoreMaster.amountIncreaseInDollar =
          Number(payrollByStoreMaster.amountIncreaseInDollar) +
          Number(payrollByStoreResponse.totalMonthlySalaryLastMonth);
        payrollByStoreMaster.amountIncreaseInPercentage =
          (Number(payrollByStoreMaster.amountIncreaseInDollar) /
            Number(payrollByStoreMaster.monthlySalaryLastMonth)) *
            100 || 0;
        payrollByStoreMaster.fixedSalaryLastMonth =
          Number(payrollByStoreMaster.fixedSalaryLastMonth) +
          Number(payrollByStoreResponse.totalFixedMonthlySalaryLastMonth);
        payrollByStoreMaster.fixedAmountInDollar =
          Number(payrollByStoreMaster.fixedAmountInDollar) +
          Number(payrollByStoreResponse.totalFixedAmountIncreaseInDollar);
        payrollByStoreMaster.fixedAmountIncreaseInPercentage =
          (Number(payrollByStoreMaster.fixedAmountInDollar) /
            Number(payrollByStoreMaster.fixedSalaryLastMonth)) *
            100 || 0;

        //calculate grandTotal for dynamic benefit components
        benefitComponents.forEach((benefitComponent: BenefitComponent) => {
          if (payrollByStoreResponse[benefitComponent.name]) {
            payrollByStoreMaster[benefitComponent.name] += Number(
              payrollByStoreResponse[benefitComponent.name]
            );
          }
        });
      }
    );

    return payrollByStoreMaster;
  }

  getTotalSalaryPayrollInTheSameStoreLastMonth(
    payrollByStoreLastMonth: PayrollByStore[],
    payrollByStore: PayrollByStore
  ) {
    return payrollByStoreLastMonth.find(
      (payrollByStoreLastMonth: PayrollByStore) =>
        payrollByStoreLastMonth.store.id === payrollByStore.store.id
    );
  }

  async getTotalMonthlySalaryLastMonth(
    dateTime: Date | string,
    isPreviousMonth = false
  ) {
    let startDate: any;
    let endDate: any;
    if (!isPreviousMonth) {
      startDate = dayJs(dateTime)
        .startOf('month')
        .format(DEFAULT_DATE_TIME_FORMAT);
      endDate = dayJs(dateTime).endOf('month').format(DEFAULT_DATE_TIME_FORMAT);
    } else {
      startDate = dayJs(dateTime)
        .startOf('month')
        .subtract(1, 'month')
        .format(DEFAULT_DATE_TIME_FORMAT);
      endDate = dayJs(dateTime)
        .endOf('month')
        .subtract(1, 'month')
        .format(DEFAULT_DATE_TIME_FORMAT);
    }

    return await this.payrollByStoreRepo.find({
      where: {
        date: Between(startDate, endDate),
        payrollReport: {
          date: Between(startDate, endDate),
          employee: {
            positions: { isDefaultPosition: true, isMoved: false }
          }
        }
      },
      relations: {
        store: { companyStructureComponent: true },
        payrollReport: {
          employee: true,
          payrollReportDetail: true
        }
      },
      select: {
        store: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            nameKh: true
          }
        },
        payrollReport: {
          id: true,
          deduction: true,
          benefit: true,
          basicSalary: true,
          basicSalary2: true,
          date: true,
          proratePerDay: true,
          seniority: true,
          totalMonthly: true,
          totalMonthlyRound: true,
          pensionFund: true,
          totalExcludePension: true,
          salaryTaxWithHeld: true,
          nonTaxSeniority: true,
          netTotal: true,
          attendanceAllowance: true,
          attendanceAllowanceByConfiguration: true,
          employee: {
            id: true,
            displayFullNameEn: true,
            positions: {
              id: true,
              companyStructureOutlet: {
                id: true,
                companyStructureComponent: {
                  id: true,
                  name: true,
                  nameKh: true
                }
              }
            }
          }
        }
      }
    });
  }

  calTotalValueInStoreBaseOneColumnName(
    payrollReport: PayrollReport[],
    columnName: string
  ): number {
    if (!payrollReport.length) {
      return 0;
    }

    let totalAmount = 0;
    payrollReport.forEach((payrollReport: PayrollReport) => {
      if (payrollReport[columnName]) {
        totalAmount = Number(totalAmount) + Number(payrollReport[columnName]);
      }
    });

    return totalAmount;
  }

  async mappingEmployeePayrollBenefit(
    payrollReportDetails: PayrollReportDetail[],
    benefitComponents: BenefitComponent[]
  ) {
    const payloadBenefitResponse: any = [];

    if (!payrollReportDetails.length) {
      if (!benefitComponents.length) {
        return [];
      }

      benefitComponents.forEach((benefitComponent: BenefitComponent) => {
        payloadBenefitResponse.push({
          [benefitComponent?.name]: 0
        });
      });
    } else if (benefitComponents.length) {
      for (const payrollReportDetail of payrollReportDetails) {
        const benefitComponent = benefitComponents.find(
          (benefitComponent: BenefitComponent) => {
            if (benefitComponent.id === payrollReportDetail.typeId) {
              return benefitComponent;
            }
          }
        );

        if (benefitComponent) {
          payloadBenefitResponse.push({
            [benefitComponent.name]: payrollReportDetail.amount
          });
        } else {
          benefitComponents.forEach((benefitComponent: BenefitComponent) => {
            payloadBenefitResponse.push({
              [benefitComponent.name]: 0
            });
          });
        }
      }
    }

    return { ...payloadBenefitResponse };
  }

  async getEmployeePositions(employeeId: number) {
    return await this.employeePositionRepo.find({
      where: { employee: { id: employeeId } },
      relations: {
        employee: true,
        companyStructureOutlet: { companyStructureComponent: true }
      },
      select: {
        employee: { id: true },
        companyStructureOutlet: {
          id: true,
          companyStructureComponent: { id: true, name: true }
        }
      }
    });
  }

  getPayrollBenefitAndDeduction(
    payroll: PayrollReport,
    benefitComponents: BenefitComponent[],
    payrollDeductionTypes: PayrollDeductionType[]
  ) {
    for (const detail of payroll.payrollReportDetail) {
      if (detail.type === 'BENEFIT') {
        const benefitComponent: BenefitComponent = benefitComponents.find(
          (component) => component.id === detail.id
        );

        if (benefitComponent) {
          detail['name'] = benefitComponent.name;
        }
      } else if (detail.type === 'DEDUCTION') {
        const temp = payrollDeductionTypes.find(
          (deductionType) => deductionType.payrollDeduction.id === detail.id
        );
        if (temp) {
          detail['name'] = temp.name;
        }
      }
    }

    return payroll;
  }

  async calculateSummary(payroll: PayrollReport, summaryTotal: any) {
    const roundAmount = await this.grpcService.getGlobalConfigurationByName({
      name: 'round-amount'
    });
    summaryTotal.pensionFund += Number(payroll.pensionFund);
    summaryTotal.totalMonthlyExcludePensionFund += Number(
      payroll.totalExcludePension
    );
    summaryTotal.salaryTax += Number(payroll.salaryTaxWithHeld);
    summaryTotal.nonTaxSeniority += Number(payroll.nonTaxSeniority);
    summaryTotal.netTotal += Number(payroll.netTotal);

    payroll.proratePerDay = round(payroll.proratePerDay, roundAmount.value);
    payroll.basicSalary2 = round(payroll.basicSalary2, roundAmount.value);
    payroll.basicSalary = round(payroll.basicSalary, roundAmount.value);
    payroll.totalMonthly = round(payroll.totalMonthly, roundAmount.value);

    return summaryTotal;
  }

  async getPayrollReportForEssUser(
    pagination: PayrollReportForEssUserPagination
  ) {
    const employee = await this.getCurrentEmployee();

    if (employee) {
      const employeePosition: EmployeePosition[] =
        await this.getEmployeePositions(employee?.id);

      let dateCondition: Date | FindOperator<Date> = null;
      if (pagination.month && pagination.year) {
        dateCondition = Raw(
          (date) => `TO_CHAR(${date},${DEFAULT_YEAR_MONTH_FORMAT})  = :date`,
          {
            date: pagination.year + '-' + pagination.month
          }
        );
      } else if (pagination.year) {
        dateCondition = Raw(
          (date) => `TO_CHAR(${date},${DEFAULT_YEAR_FORMAT})  = :year`,
          {
            year: pagination.year
          }
        );
      } else if (pagination.month) {
        dateCondition = Raw(
          (date) => `TO_CHAR(${date},${DEFAULT_MONTH_FORMAT})  = :month`,
          {
            month: pagination.month
          }
        );
      }

      const payrollReport = await this.payrollReportRepo.findAllWithPagination(
        pagination,
        [],
        {
          where: {
            employee: {
              id: employee.id
            },
            date: dateCondition
          },
          relation: PAYROLL_REPORT_RELATIONSHIP,
          select: PAYROLL_REPORT_SELECTED_FIELDS
        }
      );

      const benefitComponents = await this.benefitComponentRepo.find();

      const payrollDeductionTypes = await this.payrollDeductionTypeRepo.find({
        relations: { payrollDeduction: true },
        select: { payrollDeduction: { id: true }, id: true, name: true }
      });

      const payrollReportResponse = [];

      for (const position of employeePosition) {
        let summaryTotal = {
          totalMonthly: 0,
          totalMonthlyRound: 0,
          pensionFund: 0,
          totalMonthlyExcludePensionFund: 0,
          salaryTax: 0,
          nonTaxSeniority: 0,
          netTotal: 0
        };

        let payrollReportData: any;
        for (const payroll of payrollReport.data) {
          if (
            payroll.payrollByStore.store.id ===
            position.companyStructureOutlet.id
          ) {
            summaryTotal = await this.calculateSummary(payroll, summaryTotal);

            payrollReportData = this.getPayrollBenefitAndDeduction(
              payroll,
              benefitComponents,
              payrollDeductionTypes
            );
          }
        }

        payrollReportResponse.push({
          storeId: position.companyStructureOutlet.id,
          storeName:
            position.companyStructureOutlet.companyStructureComponent.name,
          data: payrollReportData,
          summaryTotal
        });
      }

      return {
        totalCount: payrollReport.totalCount,
        data: [{ stores: [...payrollReportResponse] }]
      };
    }
  }

  async getCurrentEmployee(): Promise<Employee> {
    const userId: number = getCurrentUserFromContext();
    return await this.employeeRepo.findOne({ where: { userId: userId } });
  }
}
