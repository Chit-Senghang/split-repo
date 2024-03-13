import * as fsPromise from 'fs/promises';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';
import * as ExcelJS from 'exceljs';
import { DataSource, QueryRunner } from 'typeorm';
import { ILeaveTypeRepository } from '../leave/leave-request-type/repository/interface/leave-type.repository.interface';
import { LeaveTypeRepository } from '../leave/leave-request-type/repository/leave-type.repository';
import { UtilityService } from '../utility/utility.service';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { FileExtensionValidationPipe } from '../media/common/validators/file-extension.validator';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { Employee } from '../employee/entity/employee.entity';
import { LeaveType } from '../leave/leave-request-type/entities/leave-type.entity';
import { LeaveTypeVariation } from '../leave/leave-request-type/entities/leave-type-variation.entity';
import { LeaveTypeVariationRepository } from '../leave/leave-request-type/repository/leave-type-variation.repository';
import { ILeaveTypeVariationRepository } from '../leave/leave-request-type/repository/interface/leave-type-variation.repository.interface';
import { CreateLeaveRequestDto } from '../leave/leave-request/dto/create-leave-request.dto';
import { LeaveRequest } from '../leave/leave-request/entities/leave-request.entity';
import { LeaveRequestDurationTypeEnEnum } from '../leave/leave-request/enums/leave-request-duration-type.enum';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { validateDateTime } from '../shared-resources/utils/validate-date-format';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import { LeaveStockRepository } from '../leave/leave-request/repository/leave-stock.repository';
import { ILeaveStockRepository } from '../leave/leave-request/repository/interface/leave-stock-repository.interface';
import { LeaveStock } from '../leave/leave-request/entities/leave-stock.entity';
import { LeaveStockDetailRepository } from '../leave/leave-request/repository/leave-stock-detail.repository';
import { ILeaveStockDetailRepository } from '../leave/leave-request/repository/interface/leave-stock-detail.repository.interface';
import { LeaveStockDetailTypeEnum } from '../leave/leave-request/enums/leave-stock-detail.enum';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { LeaveStockDetail } from '../leave/leave-request/entities/leave-stock-detail.entity';
import { WorksheetName } from './enums/worksheet-name.enum';

@Injectable()
export class MigrationDataService {
  private readonly MISSING_FILE = 'Please upload your attachment.';

  private readonly FILE_UPLOAD = 'File upload';

  constructor(
    @Inject(LeaveTypeRepository)
    private readonly leaveTypeRepository: ILeaveTypeRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(LeaveTypeVariationRepository)
    private readonly leaveTypeVariationRepository: ILeaveTypeVariationRepository,
    @Inject(LeaveStockRepository)
    private readonly leaveStockRepository: ILeaveStockRepository,
    @Inject(LeaveStockDetailRepository)
    private readonly leaveStockDetailRepo: ILeaveStockDetailRepository,
    private readonly utilityService: UtilityService,
    private readonly validateFileService: FileExtensionValidationPipe,
    private readonly dataSource: DataSource
  ) {}

  async create(file: Express.Multer.File) {
    Logger.log('Start processing leave migration');
    const { workbook, filePath } = await this.validateFile(file);

    this.createLeaveRequestFromWorkbook(workbook, filePath);
  }

  // =========================== [Private methods] ===========================

  private async createLeaveRequestFromWorkbook(
    workbook: ExcelJS.Workbook,
    filePath: string
  ) {
    const leaveTypes: LeaveType[] = await this.getLeaveTypes();

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // Loop base one enum. Key is used as leave type name and value as worksheet
      for (const [key, value] of Object.entries(WorksheetName)) {
        let leaveTypeName = key;
        const worksheet = workbook.getWorksheet(value);

        if (leaveTypeName === 'សម្រាកប្រចាំឆ្នាំ - Annual Leave') {
          worksheet.spliceColumns(3, 2); //remove columns in case AL since it has more columns than others
        }

        let isSpecialLeave = false;
        if (leaveTypeName === 'Special Leave') {
          isSpecialLeave = true;
          leaveTypeName = 'សម្រាកប្រចាំឆ្នាំ - Annual Leave';
        }

        const leaveType: LeaveType = await this.getLeaveTypeByName(
          leaveTypeName,
          leaveTypes
        );

        if (leaveType) {
          await this.createLeaveRequestFromWorksheet(
            worksheet.rowCount,
            worksheet,
            leaveType,
            isSpecialLeave,
            queryRunner
          );
        }
      }

      Logger.log('End processing leave migration');
      await queryRunner.commitTransaction();
      await fsPromise.unlink(filePath); // delete file after insert or error
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await fsPromise.unlink(filePath); // delete file when error
      Logger.log(error);
    } finally {
      await queryRunner.release();
    }
  }

  private async createLeaveRequestFromWorksheet(
    totalRowCount: number,
    worksheet: ExcelJS.Worksheet,
    leaveType: LeaveType,
    isSpecialLeave: boolean,
    queryRunner: QueryRunner
  ) {
    for (let rowNumber = 6; rowNumber <= totalRowCount; rowNumber++) {
      // Insert leave request base on employee and leave type variation
      await this.createLeaveRequestForEmployee(
        queryRunner,
        worksheet,
        rowNumber,
        leaveType,
        isSpecialLeave
      );
    }
  }

  private async validateFile(file: Express.Multer.File): Promise<{
    workbook: ExcelJS.Workbook;
    filePath: string;
  }> {
    if (!file) {
      throw new ResourceNotFoundException(this.FILE_UPLOAD, this.MISSING_FILE);
    }

    await this.validateFileService.transform(file.originalname); // validate supported extension

    await this.utilityService.validateFileSize(file.size); // validate file size

    const fileName = this.utilityService.createFileName(); // generate file name

    const excelFile = {
      name: this.utilityService.createNewFileNameWithExtension(
        fileName,
        file.originalname
      ),
      buffer: file.buffer,
      size: file.size,
      originalName: file.originalname
    };

    const filePath = this.utilityService.createFilePath(
      excelFile.name,
      'templates'
    ); // add uploaded file to folder templates

    await fsPromise.writeFile(filePath, excelFile.buffer, 'binary');

    const workbook = new ExcelJS.Workbook();

    return {
      workbook: await workbook.xlsx.readFile(filePath),
      filePath
    };
  }

  private async getEmployeeFromWorksheet(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number
  ): Promise<Employee> {
    const employeeId = worksheet.getCell('A' + rowNumber).value;
    return await this.employeeRepository.getEmployeeByAccountNumberForImport(
      String(employeeId)
    );
  }

  private getTotalDayInMonth(date: string): number {
    return dayJs(date.toString().split(' ').at(3), 'MMM').daysInMonth();
  }

  private async getLeaveTypes(): Promise<LeaveType[]> {
    return await this.leaveTypeRepository.find();
  }

  private async getLeaveTypeByName(
    name: string,
    leaveTypes: LeaveType[]
  ): Promise<LeaveType> {
    return leaveTypes.find(
      (leaveType: LeaveType) => leaveType.leaveTypeName === name
    );
  }

  private createLeaveRequest(
    createLeaveRequestDto: CreateLeaveRequestDto,
    userId: number
  ) {
    validateDateTime(createLeaveRequestDto.fromDate);
    validateDateTime(createLeaveRequestDto.toDate);

    const sql = `INSERT INTO leave_request (employee_id,leave_type_id,status,is_special_leave,from_date,to_date,leave_duration,duration_type,created_by)
      VALUES(${createLeaveRequestDto.employeeId},
        ${createLeaveRequestDto.leaveRequestTypeId},
        '${StatusEnum.ACTIVE}',
        ${createLeaveRequestDto.isSpecialLeave},
        '${createLeaveRequestDto.fromDate}',
        '${createLeaveRequestDto.toDate}',
         ${createLeaveRequestDto.leaveDuration},
         '${createLeaveRequestDto.durationType}',
         ${userId}
        );
    `;

    return sql;
  }

  private async createLeaveRequestForEmployee(
    queryRunner: QueryRunner,
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    leaveType: LeaveType,
    isSpecialLeave: boolean
  ) {
    const employee: Employee = await this.getEmployeeFromWorksheet(
      worksheet,
      rowNumber
    );

    if (employee) {
      const dateTime = String(worksheet.getCell('A3').value); // Ex: Annual Leaves - Oct 2023

      const daysInMonth: number = this.getTotalDayInMonth(dateTime); //Ex: 31

      const leaveRequestDate = dateTime.split(' - ').at(1).replace(' ', '/'); //Ex: Oct/2023

      const leaveTypeVariation: LeaveTypeVariation =
        await this.leaveTypeVariationRepository.getLeaveTypeVariationByEmployeeAndLeaveTypeId(
          employee,
          leaveType.id
        );

      if (leaveTypeVariation) {
        const month = Number(dayJs(leaveRequestDate).get('month')) + 1;
        // calculate carry forward for employee on January and for AL
        if (month === 2 && worksheet.name === 'AL') {
          //GET: remaining carry forward from column 'REMAINING AL FROM FORWARD'
          const carryForwardRemaining = this.getValueFromWorksheet(
            worksheet,
            rowNumber,
            44
          );

          //GET: actual carry forward from column '# AL 2022 FORWARD'
          const actualCarryForward = this.getValueFromWorksheet(
            worksheet,
            rowNumber,
            42
          );

          const leaveStock: LeaveStock | null =
            await this.leaveStockRepository.getLeaveStockByLeaveTypeVariation(
              leaveTypeVariation,
              employee.id,
              {
                fromDate: leaveRequestDate,
                toDate: leaveRequestDate
              }
            );

          if (leaveStock) {
            //insert carry forward used in February
            await this.calculateCarryForward(
              Number(carryForwardRemaining),
              Number(actualCarryForward),
              leaveStock,
              queryRunner
            );
          }
        }

        let leaveStock: LeaveStock;

        // Insert leave stock for only December
        if (month === 12) {
          const leaveDay = this.getLeaveDurationFromWorksheet(
            worksheet,
            rowNumber
          );

          if (worksheet.name === 'SPL') {
            const specialLeaveAllowanceDay =
              this.getSpecialLeaveAllowanceForWorksheet(worksheet, rowNumber);

            await this.calculateSpecialLeaveRemaining(
              employee.id,
              leaveTypeVariation.leaveType.id,
              Number(specialLeaveAllowanceDay),
              Number(dayJs(dateTime).get('year')),
              queryRunner
            );
          } else {
            const totalLeavePerYear =
              this.getEmployeeTotalLeavePerYearFromWorksheet(
                worksheet,
                rowNumber
              );

            leaveStock = await this.calculateLeaveRemaining(
              queryRunner,
              employee,
              leaveTypeVariation,
              Number(dayJs(dateTime).get('year')),
              Number(leaveDay),
              Number(totalLeavePerYear)
            );
          }
        }

        const leaveRequestDto: CreateLeaveRequestDto = {
          employeeId: employee.id,
          leaveRequestTypeId: leaveTypeVariation.id,
          isSpecialLeave,
          durationType: LeaveRequestDurationTypeEnEnum.DATE_RANGE,
          isPublicHoliday: false,
          fromDate: null,
          toDate: null,
          documentIds: [],
          reason: null,
          reasonTemplateId: null,
          leaveDuration: 0
        };

        if (!leaveStock) {
          leaveStock = await this.getEmployeeLeaveStock(
            employee.id,
            leaveTypeVariation.leaveType.id
          );
        }

        await this.createLeaveRequestByMonth(
          queryRunner,
          daysInMonth,
          leaveRequestDate,
          worksheet,
          leaveRequestDto,
          rowNumber,
          employee
        );
      }
    }
  }

  private async getTotalCarryForwardUsedInJanuary(
    leaveStockId: number
  ): Promise<number> {
    const leaveStockDetails = await this.leaveStockDetailRepo.find({
      where: {
        leaveStock: { id: leaveStockId },
        type: LeaveStockDetailTypeEnum.CARRY_FORWARD
      },
      relations: { leaveStock: true },
      select: { leaveStock: { id: true } }
    });
    let totalCarryForwardUsed = 0;
    leaveStockDetails.forEach(
      (leaveStockDetail: LeaveStockDetail) =>
        (totalCarryForwardUsed =
          Number(totalCarryForwardUsed) + Number(leaveStockDetail.leaveDay))
    );

    return totalCarryForwardUsed;
  }

  private async insertCarryForwardInFebruary(
    year: number,
    month: number,
    leaveStock: LeaveStock,
    totalCarryForwardUsed: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    const carryForwardUsedInJanuary =
      await this.getTotalCarryForwardUsedInJanuary(leaveStock.id);

    const carryForwardUsedInFeb =
      Number(totalCarryForwardUsed) - Number(carryForwardUsedInJanuary);
    const leaveStockDetail = this.leaveStockDetailRepo.create({
      leaveDay: carryForwardUsedInFeb,
      leaveStock: { id: leaveStock.id },
      month,
      year,
      type: LeaveStockDetailTypeEnum.CARRY_FORWARD
    });
    await queryRunner.manager.save(leaveStockDetail);
  }

  private async createLeaveRequestByMonth(
    queryRunner: QueryRunner,
    daysInMonth: number,
    requestDate: string,
    worksheet: ExcelJS.Worksheet,
    leaveRequestDto: CreateLeaveRequestDto,
    rowNumber: number,
    employee: Employee
  ) {
    // loop through one month. Ex: daysInMonth = 31
    const userAdminId = getCurrentUserFromContext();
    let insertLeaveRequestSqlScript = '';
    for (let day = 1; day <= daysInMonth; day++) {
      const leaveDuration = this.getLeaveDuration(worksheet, rowNumber, day);

      if (leaveDuration > 0) {
        const leaveRequestDate = dayJs(`${day + '/' + requestDate}`).format(
          DEFAULT_DATE_FORMAT
        );

        leaveRequestDto.leaveDuration = leaveDuration;
        leaveRequestDto.fromDate = leaveRequestDate;

        let toDate = leaveRequestDate;

        if (leaveDuration >= 1) {
          // toDate change to fromDate plus duration day. Ex: fromDate = 10/12/2023 and leaveDuration = 2 => toDate = 12/12/2023
          toDate = dayJs(leaveRequestDate)
            .add(leaveDuration - 1, 'day')
            .format(DEFAULT_DATE_FORMAT);

          leaveRequestDto.durationType =
            LeaveRequestDurationTypeEnEnum.DATE_RANGE;
        } else {
          // case leave request for half day
          const leaveRequestInFirstHalfDay =
            await this.getLeaveRequestInSpecificDateByLeaveTypeVariationId(
              queryRunner,
              leaveRequestDate,
              leaveRequestDto.leaveRequestTypeId,
              employee.id
            );

          //When already have half day leave, second time insert we will consider it as SECOND_HALF_DAY
          if (leaveRequestInFirstHalfDay) {
            leaveRequestDto.durationType =
              LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY;
          } else {
            leaveRequestDto.durationType =
              LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY;
          }
        }

        leaveRequestDto.toDate = toDate;

        insertLeaveRequestSqlScript += this.createLeaveRequest(
          leaveRequestDto,
          userAdminId
        );
      }
    }

    return await queryRunner.manager.query(insertLeaveRequestSqlScript);
  }

  private async getLeaveRequestInSpecificDateByLeaveTypeVariationId(
    queryRunner: QueryRunner,
    date: string,
    leaveTypeVariationId: number,
    employeeId: number
  ): Promise<LeaveRequest> {
    return await queryRunner.manager.findOne(LeaveRequest, {
      where: {
        leaveTypeVariation: { id: leaveTypeVariationId },
        fromDate: date,
        employee: { id: employeeId }
      },
      relations: {
        employee: true,
        leaveTypeVariation: true
      },
      select: {
        employee: { id: true },
        leaveTypeVariation: { id: true }
      }
    });
  }

  private async calculateLeaveRemaining(
    queryRunner: QueryRunner,
    employee: Employee,
    leaveTypeVariation: LeaveTypeVariation,
    year: number,
    leaveDay: number,
    totalLeavePerYear: number
  ) {
    const leaveStockEntity = this.leaveStockRepository.create({
      employee: { id: employee.id },
      leaveType: { id: leaveTypeVariation.leaveType.id },
      year,
      leaveDay,
      policyAllowancePerYear: leaveTypeVariation.allowancePerYear,
      policyProratePerMonth: leaveTypeVariation?.proratePerMonth ?? 0,
      policyBenefitAllowanceDay: leaveTypeVariation?.benefitAllowanceDay ?? 0,
      policyBenefitAllowancePercentage:
        leaveTypeVariation?.benefitAllowancePercentage ?? 0,
      policySpecialLeaveAllowanceDay:
        leaveTypeVariation?.specialLeaveAllowanceDay ?? 0,
      policyCarryForwardAllowance:
        leaveTypeVariation.leaveType?.carryForwardAllowance ?? 0,
      policyCarryForwardStatus: leaveTypeVariation.leaveType.carryForwardStatus,
      policyIncrementAllowance:
        leaveTypeVariation.leaveType?.incrementAllowance ?? 0,
      policyIncrementRule: leaveTypeVariation.leaveType?.incrementRule ?? 0,
      specialLeaveAllowanceDay:
        leaveTypeVariation?.specialLeaveAllowanceDay ?? 0,
      leaveDayTopUp: leaveTypeVariation.leaveType.incrementRule
        ? Number(
            this.calculateLeaveTopUp(leaveTypeVariation.leaveType, employee)
          )
        : 0,
      leaveDayTopUpRemaining: leaveTypeVariation.leaveType.incrementRule
        ? this.calculateLeaveTopUpRemaining(
            leaveDay,
            leaveTypeVariation.allowancePerYear,
            totalLeavePerYear
          )
        : 0
    });

    return await queryRunner.manager.save(leaveStockEntity);
  }

  private async calculateCarryForward(
    carryForwardRemaining = 0,
    actualCarryForward: number,
    leaveStock: LeaveStock,
    queryRunner: QueryRunner
  ) {
    if (leaveStock) {
      const carryForwardExpiryDate = dayJs()
        .set('month', 1)
        .endOf('month')
        .format(DEFAULT_DATE_FORMAT);

      const remainingCarryForward =
        Number(carryForwardRemaining) > 0 ? Number(carryForwardRemaining) : 0;

      const leaveStockEntity = this.leaveStockRepository.create({
        ...leaveStock,
        actualCarryForward: actualCarryForward,
        carryForward: Number(remainingCarryForward),
        carryForwardRemaining: Number(remainingCarryForward),
        carryForwardExpiryDate
      });

      return await queryRunner.manager.save(leaveStockEntity);
    }
  }

  private async calculateSpecialLeaveRemaining(
    employeeId: number,
    leaveTypeId: number,
    specialLeaveAllowanceDay: number,
    year: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    const leaveStock = await this.leaveStockRepository.findOne({
      where: {
        employee: { id: employeeId },
        leaveType: { id: leaveTypeId },
        year
      },
      relations: { employee: true, leaveType: true }
    });

    if (leaveStock) {
      const leaveStockEntity: LeaveStock = this.leaveStockRepository.create({
        ...leaveStock,
        specialLeaveAllowanceDay
      });

      await queryRunner.manager.save(leaveStockEntity);
    }
  }

  private async getEmployeeLeaveStock(
    employeeId: number,
    leaveTypeId: number
  ): Promise<LeaveStock> {
    return await this.leaveStockRepository.findOne({
      where: {
        employee: { id: employeeId },
        leaveType: { id: leaveTypeId }
      },
      relations: { employee: true, leaveType: true },
      select: { employee: { id: true } }
    });
  }

  private getEmployeeTotalLeavePerYearFromWorksheet(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number
  ): number {
    let totalLeavePerYear = worksheet.getRow(rowNumber).getCell(41).value ?? 0;

    if (totalLeavePerYear['result']) {
      totalLeavePerYear = totalLeavePerYear['result'];
    } else if (isNaN(Number(totalLeavePerYear))) {
      totalLeavePerYear = 0;
    }

    return Number(totalLeavePerYear);
  }

  private getSpecialLeaveAllowanceForWorksheet(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number
  ): number {
    let specialLeaveAllowanceDay =
      worksheet.getRow(rowNumber).getCell(40).value ?? 0;

    if (specialLeaveAllowanceDay['result']) {
      specialLeaveAllowanceDay = specialLeaveAllowanceDay['result'];
    } else if (isNaN(Number(specialLeaveAllowanceDay))) {
      specialLeaveAllowanceDay = 0;
    }

    return Number(specialLeaveAllowanceDay);
  }

  private getLeaveDurationFromWorksheet(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number
  ): number {
    let leaveDay = worksheet.getRow(rowNumber).getCell(41).value ?? 0; // normal excel worksheet
    if (worksheet.name === 'AL') {
      leaveDay = worksheet.getRow(rowNumber).getCell(47).value ?? 0; // GET: value from last column of Annual Leave worksheet
    }

    if (leaveDay['result']) {
      leaveDay = leaveDay['result'];
    } else if (isNaN(Number(leaveDay))) {
      leaveDay = 0;
    }

    return Number(leaveDay);
  }

  private getLeaveDuration(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    day: number
  ): number {
    const cellValue = Number(
      worksheet.getRow(rowNumber).getCell(day + 4).value ?? 0
    );

    let leaveDuration = cellValue;

    if (worksheet.name === 'AL') {
      worksheet.getRow(rowNumber).getCell(day + 3).value ?? 0;
    }

    if (cellValue['result']) {
      leaveDuration = cellValue['result'];
    } else if (isNaN(Number(cellValue))) {
      leaveDuration = 0;
    }

    return Number(leaveDuration);
  }

  private getValueFromWorksheet(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    cellNumber: number
  ): number {
    let carryForward =
      worksheet.getRow(rowNumber).getCell(cellNumber).value ?? 0;

    if (carryForward['result']) {
      carryForward = carryForward['result'];
    } else if (isNaN(Number(carryForward))) {
      carryForward = 0;
    }

    return Number(carryForward);
  }

  private calculateLeaveTopUpRemaining(
    leaveDayRemaining: number,
    policyAllowancePerYear: number,
    totalLeavePerYear: number
  ): number {
    const leaveDayTopUp =
      Number(totalLeavePerYear) - Number(policyAllowancePerYear);

    let leaveDayTopUpRemaining =
      Number(leaveDayRemaining) - Number(policyAllowancePerYear);
    if (leaveDayTopUpRemaining > 0 && leaveDayRemaining > leaveDayTopUp) {
      leaveDayTopUpRemaining = leaveDayTopUp;
    } else if (leaveDayTopUpRemaining <= 0) {
      leaveDayTopUpRemaining = 0;
    }

    return leaveDayTopUpRemaining;
  }

  private calculateLeaveTopUp(
    leaveType: LeaveType,
    employee: Employee
  ): number {
    const totalMilliseconds = dayJs().diff(employee.startDate); // Ex: 9999999 value as milliseconds
    const workingDuration = dayJs.duration(totalMilliseconds).asYears(); //convert total milliseconds to year.

    let leaveDayTopUp = 0;
    if (leaveType.incrementRule > 0) {
      leaveDayTopUp =
        Math.floor(Math.floor(workingDuration) / leaveType.incrementRule) *
        leaveType.incrementAllowance;
    }

    return leaveDayTopUp;
  }
}
