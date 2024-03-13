import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw, FindOptionsWhere, Not, IsNull } from 'typeorm';
import { PayrollMaster } from '../payroll-generation/entities/payroll-master.entity';
import { PayrollReport } from '../payroll-generation/entities/payroll-report.entity';
import { EmployeeStatusEnum } from '../employee/enum/employee-status.enum';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { DEFAULT_YEAR_MONTH_FORMAT } from './../shared-resources/common/dto/default-date-format';
import { MasterPayrollListDto } from './dto/master-payroll-list.dto';
import { getPreviousDate } from './common/function/get-previous-month';
import { MasterPayrollListCheckDto } from './dto/master-payroll-list-check.dto';
import { PayrollAdjustmentSummaryMasterReportDto } from './dto/payroll-adjustment-summary-report.dto';
import { getResponsePayrollAdjustmentSummaryDataReport } from './common/function/get-response-payroll-summary-data-report';
import { CalculateTypeEnum } from './common/enum/calculate-type';

@Injectable()
export class PayrollAdjustmentSummaryReportService {
  constructor(
    @InjectRepository(PayrollMaster)
    private readonly payrollMasterRepo: Repository<PayrollMaster>,
    @InjectRepository(PayrollReport)
    private readonly payrollReportRepo: Repository<PayrollReport>,
    @InjectRepository(BenefitComponent)
    private readonly benefitComponentRepo: Repository<BenefitComponent>,
    private readonly payrollSummaryReport: PayrollAdjustmentSummaryMasterReportDto
  ) {}

  // global param
  private condition:
    | FindOptionsWhere<PayrollReport>
    | FindOptionsWhere<PayrollReport>[];

  private getPayrollMaster = async (date: string) => {
    return await this.payrollMasterRepo.findOneBy({
      date: Raw(
        (alias) =>
          `TO_CHAR(${alias}, '${DEFAULT_YEAR_MONTH_FORMAT}') = '${date}'`
      )
    });
  };

  async getMasterListReport(year: string, month: string) {
    // current and previous date
    const currentDate = `${year}-${month}`;
    const previousDate = getPreviousDate(new Date(currentDate));

    // get current payroll master
    const currentPayrollMaster = await this.getPayrollMaster(currentDate);

    // get previous payroll master
    const previousPayrollMaster = await this.getPayrollMaster(previousDate);

    const masterPayrollListDto = new MasterPayrollListDto();

    masterPayrollListDto.previousTotalFixedSalary =
      previousPayrollMaster?.total ?? 0;
    masterPayrollListDto._currentTotalFixedSalary =
      currentPayrollMaster?.total ?? 0;

    // return payroll master
    return masterPayrollListDto;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getMasterPayrollListCheckReport(year: string, month: string) {
    const masterPayrollListCheckDto = new MasterPayrollListCheckDto();
    masterPayrollListCheckDto.check;

    return masterPayrollListCheckDto;
  }

  private getPayrollAdjustmentSummaryReport = async (
    condition:
      | FindOptionsWhere<PayrollReport>
      | FindOptionsWhere<PayrollReport>[],
    date: string
  ) => {
    // return data payroll adjustment summary reports with condition
    return await this.payrollReportRepo.find({
      where: {
        date: Raw(
          (alias) =>
            `TO_CHAR(${alias}, '${DEFAULT_YEAR_MONTH_FORMAT}') = '${date}'`
        ),
        ...condition
      },
      relations: {
        employee: {
          gender: {
            code: {
              codeValue: true
            }
          },
          positions: {
            companyStructureOutlet: {
              companyStructureComponent: true
            },
            companyStructureDepartment: {
              companyStructureComponent: true
            },
            companyStructurePosition: {
              companyStructureComponent: true
            }
          },
          workingShiftId: {
            workshiftType: true
          },
          payrollBenefitAdjustment: {
            payrollBenefitAdjustmentDetail: {
              benefitComponent: true
            }
          }
        }
      }
    });
  };

  private getBenefitComponent = async () => {
    return await this.benefitComponentRepo.find({
      select: {
        name: true
      }
    });
  };

  async getResignEmployeeReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition employee resigned
    this.condition = {
      employee: {
        status: EmployeeStatusEnum.RESIGNED
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent()
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees resigned
    return this.payrollSummaryReport;
  }

  async getNewEmployeeAddedReport(year: string, month: string) {
    const currentDate = `${year}-${month}`;

    // condition employee new added
    this.condition = {
      employee: {
        status: EmployeeStatusEnum.IN_PROBATION
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.TOTAL
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees new added
    return this.payrollSummaryReport;
  }

  async getPostProbationEmployeeReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition post probation
    // fix me
    this.condition = {
      employee: {
        status: EmployeeStatusEnum.ACTIVE
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees post probation
    return this.payrollSummaryReport;
  }

  async getFullPostProbationEmployeeReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition full post probation
    // fix me
    this.condition = {
      employee: {
        status: EmployeeStatusEnum.ACTIVE
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees full post probation
    return this.payrollSummaryReport;
  }

  async getSalaryIncrementReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition salary increment
    this.condition = {
      employee: {
        payrollBenefitAdjustment: {
          payrollBenefitAdjustmentDetail: {
            adjustAmount: Not(IsNull())
          }
        }
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees salary increment
    return this.payrollSummaryReport;
  }

  async getChangeWorkShiftEmployeeReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition who change work shift
    this.condition = {
      employee: {
        status: EmployeeStatusEnum.ACTIVE
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees who change work shift
    return this.payrollSummaryReport;
  }

  async getAttendanceAllowanceReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition attendance allowance added/deducted
    this.condition = {
      employee: {
        attendanceAllowanceInProbation: true
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees attendance allowance added/deducted
    return this.payrollSummaryReport;
  }

  async getNightShiftReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition night shift added/deducted
    this.condition = {
      employee: {
        attendanceAllowanceInProbation: true
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees night shift added/deducted
    return this.payrollSummaryReport;
  }

  async getWhoHadTakeReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition who had take maternity or medical leave or had adjust on position or att allowance from previous month
    this.condition = {
      employee: {
        attendanceAllowanceInProbation: true
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees night shift added/deducted
    return this.payrollSummaryReport;
  }

  async getNewHireGetFullPayCompareLastMonthReport(
    year: string,
    month: string
  ) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition who had take maternity or medical leave or had adjust on position or att allowance from previous month
    this.condition = {
      employee: {
        status: EmployeeStatusEnum.RESIGNED
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees night shift added/deducted
    return this.payrollSummaryReport;
  }

  async getResignedBeforeEndOfMonthReport(year: string, month: string) {
    // current date
    const currentDate = `${year}-${month}`;

    // condition resigned before end of month (can't get full pay)
    this.condition = {
      employee: {
        attendanceAllowanceInProbation: true
      }
    };

    // get data from database
    const dataReport = await this.getPayrollAdjustmentSummaryReport(
      this.condition,
      currentDate
    );

    // format data response by dto
    this.payrollSummaryReport.data =
      getResponsePayrollAdjustmentSummaryDataReport(
        dataReport,
        await this.getBenefitComponent(),
        CalculateTypeEnum.INCREMENT_AMOUNT
      );
    this.payrollSummaryReport.calculateSubTotal();

    // return payroll adjust summary report by employees resigned before end of month
    return this.payrollSummaryReport;
  }
}
