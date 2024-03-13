import * as ExcelJS from 'exceljs';
import * as Joi from 'joi';
import { Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  In,
  IsNull,
  MoreThanOrEqual,
  Repository
} from 'typeorm';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import {
  dayJs,
  getCurrentDate
} from '../shared-resources/common/utils/date-utils';
import { khmerMonths } from '../shared-resources/ts/constants/month-in-khmer';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PayrollReport } from '../payroll-generation/entities/payroll-report.entity';
import { Employee } from '../employee/entity/employee.entity';
import { GrpcService } from '../grpc/grpc.service';
import { EmploymentTypeEnumInKh } from '../employee/enum/employee-status.enum';
import { EmploymentStatusEnumInKh } from '../employee/enum/employment-status.enum';
import { EmployeeIdentifier } from '../employee-identifier/entities/employee-identifier.entity';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import {
  convertDateRangeToFromDateToDate,
  validateDateTime
} from '../shared-resources/utils/validate-date-format';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { PayrollBenefitAdjustment } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment.entity';
import { PayrollBenefitAdjustmentDetail } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment-detail.entity';
import { UtilityService } from '../utility/utility.service';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeNssfConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { Nssf } from './entities/nssf.entity';
import { NssfPaginate } from './dto/paginate-nssf.dto';
import { UpdateNssfDto } from './dto/update-nssf.dto';

interface NSSFInterface {
  id: number;
  employeeId: number;
  nssfId: string;
  idCard: string;
  surname: string;
  name: string;
  surNameInEn: string;
  nameInEn: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  startWorkingDate: string;
  group?: string;
  position?: string;
  employmentType: string;
  employmentStatus: string;
  salary?: number;
  salaryInAverage?: number;
  salaryWithTax?: number;
  nssfPersonalAccidentInsurance?: string | number;
  nssfHealthInsurance?: string | number;
  pensionFundEmployee?: string | number;
  pensionFundCompany?: string | number;
  totalNSSFPaid?: string | number;
}

@Injectable()
export class NssfService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeIdentifier)
    private readonly employeeIdentifier: Repository<EmployeeIdentifier>,
    @InjectRepository(Nssf)
    private readonly nssfRepo: Repository<Nssf>,
    @InjectRepository(PayrollBenefitAdjustment)
    private readonly payrollBenefitAdjustmentRepo: Repository<PayrollBenefitAdjustment>,
    @InjectRepository(PayrollReport)
    private readonly payrollReportRepo: Repository<PayrollReport>,
    private readonly grpcService: GrpcService,
    private readonly dataSource: DataSource,
    private readonly utilityService: UtilityService
  ) {}

  async findAll(pagination: NssfPaginate): Promise<PaginationResponse<Nssf>> {
    const { fromDate, toDate } = convertDateRangeToFromDateToDate({
      dateRange: { fromDate: pagination.date, toDate: pagination.date }
    });
    const employeeId =
      await this.utilityService.checkCurrentUserLoginWithESSUser();
    return GetPagination(this.nssfRepo, pagination, [], {
      relation: { employee: true },
      where: {
        date: Between(fromDate, toDate),
        id: In(employeeId)
      } as FindOptionsWhere<Nssf>
    });
  }

  async findOne(id: number) {
    const data = await this.nssfRepo.findOne({
      where: { id },
      relations: {
        employee: true
      }
    });

    if (!data) {
      throw new ResourceNotFoundException(
        'NSSF',
        `NSSF id ${id} was not found`
      );
    }
    return data;
  }

  async update(id: number, updateNssf: UpdateNssfDto) {
    try {
      const data = await this.findOne(id);
      const nssf = this.nssfRepo.create({ ...data, ...updateNssf });
      return await this.nssfRepo.save(nssf);
    } catch (exception) {
      handleResourceConflictException(exception, employeeNssfConstraint);
    }
  }

  async createNSSF(file: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const date = getCurrentDate().format(DEFAULT_DATE_FORMAT);
      const toDate = dayJs(date).endOf('month').toDate();
      const fromDate = dayJs(date).startOf('month').toDate();
      const data: any = await this.readBufferExcelToJson(file.buffer);

      const schema = Joi.object({
        id: Joi.number().required(),
        employeeId: Joi.number().required(),
        nssfId: Joi.required(),
        salary: Joi.required(),
        salaryInAverage: Joi.required(),
        salaryWithTax: Joi.required(),
        nssfPersonalAccidentInsurance: Joi.required(),
        nssfHealthInsurance: Joi.required(),
        pensionFundEmployee: Joi.required(),
        pensionFundCompany: Joi.required(),
        totalNSSFPaid: Joi.required()
      }).unknown(true);

      for (const item of data) {
        await schema.validateAsync(item);

        const temp = queryRunner.manager.create(Nssf, {
          employee: { id: item.employeeId },
          nssfHealthInsurance: item.nssfHealthInsurance,
          nssfPersonalAccidentInsurance: item.nssfPersonalAccidentInsurance,
          nssfId: item.nssfId,
          pensionFundCompany: item.pensionFundCompany,
          pensionFundEmployee: item.pensionFundEmployee,
          salary: item.salary,
          date: validateDateTime(date),
          salaryInAverage: item.salaryInAverage,
          salaryWithTax: item.salaryWithTax,
          totalNSSFPaid: item.totalNSSFPaid
        });

        const payroll = await this.payrollReportRepo.findOne({
          where: {
            employee: { id: item.employeeId },
            date: Between(fromDate, toDate)
          }
        });

        if (payroll) {
          payroll.pensionFund = temp.pensionFundEmployee;
          payroll.totalExcludePension =
            payroll.totalMonthly - payroll.pensionFund || 0;
          payroll.netTotal = payroll.netTotal - payroll.pensionFund || 0;

          const payrollUpdate = queryRunner.manager.create(
            PayrollReport,
            payroll
          );
          await queryRunner.manager.save(payrollUpdate);

          await queryRunner.manager.save(temp);
        }
      }
      await queryRunner.commitTransaction();
      return data;
    } catch (exception) {
      Logger.error(exception);
      await queryRunner.rollbackTransaction();
      throw handleResourceConflictException(exception, employeeNssfConstraint);
    }
  }

  async downLoadExcel() {
    const employees = await this.employeeRepo.find({
      where: {
        positions: {
          isMoved: false
        }
      },
      relations: { gender: true, nationality: true, positions: true }
    });
    const { value: exchangeRate }: any =
      await this.grpcService.getGlobalConfigurationByName({
        name: 'exchange_rate_nssf'
      });
    const data = [];
    let id = 1;
    const excelHeader = [
      'ល​.រ',
      'អត្ត.នៅសហគ្រាស',
      'លេខអត្ត.ប.ស.ស',
      'អត្ត.ប្រជាពលរដ្ធ',
      'គោតនាម',
      'នាម',
      'គោតនាមឡាតាំង',
      'នាមឡាតាំង',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'សញ្ជាតិ',
      'កាលបរិ.ចូលធ្វើការ',
      // 'ក្រុម',
      // 'តួនាទី',
      'ប្រភេទកម្មករនិយោជិត',
      'ស្ថានភាព',
      'ប្រាក់បៀវត្ស (រៀល/ដុល្លា)',
      'ប្រាក់ឈ្នួលប្រចាំខែ'
      /* eslint-disable */
      // 'ប្រាក់ឈ្នួលជាប់ភាគទាន',
      // 'ភាគទាន​ហ.ក',
      // 'ភាគទាន​ស.ភ',
      // 'ភាគទាន​ស.ធ កម្មករនិយោជិត',
      // 'ភាគទាន​ស.ធ សហគ្រាស',
      // 'ចំនួនភាគទាន'
      /* eslint-enable */
    ];
    const { fromDate, toDate } = this.convertFromDateToDate();
    for (const employee of employees) {
      const payrollBenefitAdjustment =
        await this.payrollBenefitAdjustmentRepo.findOne({
          where: [
            {
              employee: { id: employee.id },
              payrollBenefitAdjustmentDetail: {
                effectiveDateFrom: Between(fromDate, toDate),
                effectiveDateTo: IsNull()
              }
            },
            {
              employee: { id: employee.id },
              payrollBenefitAdjustmentDetail: {
                effectiveDateFrom: Between(fromDate, toDate),
                effectiveDateTo: MoreThanOrEqual(toDate)
              }
            }
          ] as FindOptionsWhere<PayrollBenefitAdjustment>,
          relations: {
            payrollBenefitAdjustmentDetail: {
              benefitComponent: { benefitComponentType: true }
            }
          }
        });

      let basicSalary = 0;

      payrollBenefitAdjustment.payrollBenefitAdjustmentDetail.forEach(
        (payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail) => {
          basicSalary += Number(payrollBenefitAdjustmentDetail?.adjustAmount);
        }
      );

      const document = await this.employeeIdentifier.findOne({
        where: { documentTypeId: { value: 'Khmer Identity Card' } }
      });
      const nssf: NSSFInterface = {
        id,
        employeeId: employee.id,
        nssfId: '',
        idCard: document?.documentIdentifier ?? '',
        surname: employee.lastNameKh,
        name: employee.firstNameKh,
        surNameInEn: employee.lastNameEn,
        nameInEn: employee.firstNameEn,
        gender: employee.gender.value,
        dateOfBirth: `${employee.dob}`,
        nationality:
          employee.nationality.valueInKhmer ?? employee.nationality.value,
        startWorkingDate: `${employee.startDate}`,
        // group: '',
        // position: '',
        employmentType: EmploymentTypeEnumInKh[employee.employmentType],
        employmentStatus: EmploymentStatusEnumInKh[employee.employmentStatus],
        salary: basicSalary,
        salaryInAverage: basicSalary * exchangeRate
        // salaryWithTax: 0,
        // nssfPersonalAccidentInsurance: 0,
        // nssfHealthInsurance: 0,
        // pensionFundEmployee: 0,
        // pensionFundCompany: 0,
        // totalNSSFPaid: 0
      };
      id++;

      data.push(nssf);
    }
    const currentMonth = +dayJs(data[0].date).month() + 1;
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet('Sheet1');

    const title = worksheet.addRow([
      'បញ្ជីឈ្មោះកម្មករនិយោជិតប្រចាំខែ' + khmerMonths[currentMonth]
    ]);

    // merge by start row, start column, end row, end column
    worksheet.mergeCells(1, 1, 1, excelHeader.length);

    title.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    worksheet.addRow([]);

    const row = worksheet.addRow(excelHeader);

    // Add JSON data to the worksheet
    data.forEach((row) => {
      const temp = worksheet.addRow(Object.values(row));
      temp.eachCell((cell) => {
        cell.font = {
          size: 7
        };
      });
    });

    row.eachCell((cell) => {
      cell.font = {
        size: 10
      };
    });

    return await workbook.xlsx.writeBuffer();
  }

  async readBufferExcelToJson(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    const jsonData: NSSFInterface[] = [];
    const header = {};
    const tranSlate = {
      'ល​.រ': 'id',
      'អត្ត.នៅសហគ្រាស': 'employeeId',
      'លេខអត្ត.ប.ស.ស': 'nssfId',
      'អត្ត.ប្រជាពលរដ្ធ': 'idCard',
      ['គោតនាម']: 'surname',
      ['នាម']: 'name',
      ['គោតនាមឡាតាំង']: 'surNameInEn',
      ['នាមឡាតាំង']: 'nameInEn',
      ['ភេទ']: 'gender',
      ['ថ្ងៃខែឆ្នាំកំណើត']: 'dateOfBirth',
      ['សញ្ជាតិ']: 'nationality',
      'កាលបរិ.ចូលធ្វើការ': 'startWorkingDate',
      ['ក្រុម']: 'group',
      ['តួនាទី']: 'position',
      ['ប្រភេទកម្មករនិយោជិត']: 'employmentType',
      ['ស្ថានភាព']: 'employmentStatus',
      'ប្រាក់បៀវត្ស (រៀល/ដុល្លា)': 'salary',
      ['ប្រាក់ឈ្នួលប្រចាំខែ']: 'salaryInAverage',
      ['ប្រាក់ឈ្នួលជាប់ភាគទាន']: 'salaryWithTax',
      'ភាគទាន​ ហ.ក': 'nssfPersonalAccidentInsurance',
      'ភាគទាន​ ស.ភ': 'nssfHealthInsurance',
      'ភាគទាន​ ស.ធ កម្មករនិយោជិត': 'pensionFundEmployee',
      'ភាគទាន​ ស.ធ សហគ្រាស': 'pensionFundCompany',
      ['ចំនួនភាគទាន']: 'totalNSSFPaid'
    };

    worksheet.eachRow({ includeEmpty: true }, (row) => {
      let breakLoop = false;

      if (Object.keys(header).length < 1) {
        row.eachCell((cell, colNumber) => {
          if ((cell['_mergeCount'] > 0 && cell.value) || breakLoop) {
            breakLoop = true;
            return;
          } else if (cell.value) {
            header[`column${colNumber}`] = cell.value;
          }
        });
      } else {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          rowData[tranSlate[header[`column${colNumber}`]]] = cell.value;
        });
        jsonData.push(rowData);
      }
    });

    return jsonData;
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
}
