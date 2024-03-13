import * as fs from 'fs';
import { join } from 'path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateTime
} from '../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { LeaveTypeVariation } from '../leave/leave-request-type/entities/leave-type-variation.entity';
import { LeaveType } from '../leave/leave-request-type/entities/leave-type.entity';
import { ILeaveTypeVariationRepository } from '../leave/leave-request-type/repository/interface/leave-type-variation.repository.interface';
import { ILeaveTypeRepository } from '../leave/leave-request-type/repository/interface/leave-type.repository.interface';
import { LeaveTypeRepository } from '../leave/leave-request-type/repository/leave-type.repository';
import { CreateLeaveRequestDto } from '../leave/leave-request/dto/create-leave-request.dto';
import { LeaveRequestDurationTypeEnEnum } from '../leave/leave-request/enums/leave-request-duration-type.enum';
import { LeaveRequestService } from '../leave/leave-request/leave-request.service';
import { ReasonTemplateTypeEnum } from '../reason-template/common/ts/enum/type.enum';
import { IReasonTemplateRepository } from '../reason-template/repository/interface/reason-template.repository.interface';
import { ReasonTemplateRepository } from '../reason-template/repository/reason-template.repository';
import { UtilityService } from '../utility/utility.service';
import { LeaveTypeVariationRepository } from './../leave/leave-request-type/repository/leave-type-variation.repository';
import { BulkImportBaseService } from './bulk-import-base.service';
import { EMPLOYEE_LEAVE_REQUEST_HEADERS } from './constant/employee-leave-request-header.constants';
import { HEADER_STYLE } from './constant/header-style.constant';
import { FileName } from './enum/file-name.enum';
import { RecordStatus } from './enum/record-status.enum';
import { BulkTypeEnum } from './enum/type.enum';
import { IBulkImportDocument } from './repository/interface/bulk-import-document.interface';

@Injectable()
export class BulkImportLeaveRequest implements IBulkImportDocument {
  constructor(
    private readonly utilityService: UtilityService,
    private readonly bulkImportBaseService: BulkImportBaseService,
    @Inject(LeaveTypeVariationRepository)
    private readonly leaveTypeVariationRepo: ILeaveTypeVariationRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(LeaveTypeRepository)
    private readonly leaveTypeRepo: ILeaveTypeRepository,
    @Inject(ReasonTemplateRepository)
    private readonly reasonTemplateRepo: IReasonTemplateRepository,
    private readonly leaveRequestService: LeaveRequestService
  ) {}

  async import(fileName: string, importStartTime: string): Promise<void> {
    const workbook: ExcelJS.Workbook =
      await this.bulkImportBaseService.readExcel(fileName);

    const path: string = this.utilityService.createFilePath(
      `${FileName.BULK_TIME_RESULT}.xlsx`,
      'templates'
    );

    const resultWorkbook =
      await this.bulkImportBaseService.addEmployeeOutputTemplate(
        EMPLOYEE_LEAVE_REQUEST_HEADERS
      );

    const resultWorksheet = resultWorkbook.getWorksheet('Failed Records');

    //GET: employee leave request worksheet
    const worksheet = workbook.getWorksheet('Employee Leave Request');
    const actualRowCount = worksheet.actualRowCount;
    const reasonTemplate = await this.reasonTemplateRepo.findOne({
      where: { type: ReasonTemplateTypeEnum.OTHER }
    });
    let successCount = 0;
    let failureCount = 0;
    for (let rowNumber = 2; rowNumber <= actualRowCount; rowNumber++) {
      try {
        const employeeResignationDto: CreateLeaveRequestDto =
          await this.generateLeaveRequestDto(
            worksheet,
            rowNumber,
            reasonTemplate.id
          );
        const entity = plainToInstance(
          CreateLeaveRequestDto,
          employeeResignationDto
        );
        await this.bulkImportBaseService.handleDtoErrorMessage(entity);

        await this.leaveRequestService.create(employeeResignationDto, true);
        successCount++;
      } catch (error) {
        Logger.log(error);
        failureCount++;
        const errorMessage = this.bulkImportBaseService.handleError(error);
        this.addErrorMessageToWorksheetLeaveRequest(
          worksheet,
          rowNumber,
          resultWorksheet,
          errorMessage
        );
      }
    }

    const importEndTime = getCurrentDateTime();
    await resultWorkbook.xlsx.writeFile(path);

    const bulkImport = await this.bulkImportBaseService.createBulk({
      importStartTime,
      failureCount,
      successCount,
      totalRecord: actualRowCount - 1,
      importEndTime,
      isCompleted: true,
      type: BulkTypeEnum.LEAVE_REQUEST
    });

    await this.bulkImportBaseService.insertFileIntoMedia(bulkImport, path);
  }

  async download(): Promise<{
    mimeType: string;
    fileName: string;
    file: string;
  }> {
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const fileName = 'EmployeeLeaveRequest.xlsx';
    await this.addEmployeeLeaveRequestTemplateToWorksheet(workbook);
    const path: string = this.utilityService.createFilePath(
      fileName,
      'templates'
    );
    await workbook.xlsx.writeFile(path);

    const dirPath = join(path);
    const originalBuffer = fs.readFileSync(dirPath);

    const originalFile = await this.bulkImportBaseService.bufferAsMulterFile(
      originalBuffer,
      fileName
    );

    return {
      mimeType: originalFile.mimetype,
      fileName: originalFile.originalname,
      file: originalFile.buffer.toString('base64')
    };
  }

  // ========================== [Private block] ==========================
  private async generateLeaveRequestDto(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    reasonTemplateId: number
  ) {
    const employee: Employee =
      await this.bulkImportBaseService.getEmployeeFromWorksheet(
        worksheet,
        rowNumber
      );

    const leaveTypeName: string =
      this.bulkImportBaseService.getValueFromWorksheetByCell(
        worksheet,
        rowNumber,
        'D'
      );

    const leaveType: LeaveType = await this.leaveTypeRepo.findOne({
      where: { id: Number(leaveTypeName.split('-').at(0)) },
      select: { id: true, leaveTypeName: true, isPublicHoliday: true }
    });

    if (!leaveType) {
      throw new ResourceNotFoundException('leave type', leaveTypeName);
    }

    const leaveRequestType: LeaveTypeVariation =
      await this.leaveTypeVariationRepo.getLeaveTypeVariationByEmployeeAndLeaveTypeId(
        employee,
        leaveType.id
      );

    const durationType: string =
      this.bulkImportBaseService.getValueFromWorksheetByCell(
        worksheet,
        rowNumber,
        'E'
      );

    const fromDate: string =
      this.bulkImportBaseService.getValueFromWorksheetByCell(
        worksheet,
        rowNumber,
        'F'
      );
    const toDate: string =
      this.bulkImportBaseService.getValueFromWorksheetByCell(
        worksheet,
        rowNumber,
        'G'
      );

    const createLeaveRequestDto: CreateLeaveRequestDto = {
      reason: 'Import Leave Request',
      documentIds: [],
      reasonTemplateId,
      employeeId: employee?.id,
      leaveRequestTypeId: leaveRequestType?.id,
      durationType: durationType as LeaveRequestDurationTypeEnEnum,
      fromDate: dayJs(fromDate).format(DEFAULT_DATE_FORMAT),
      toDate: dayJs(toDate).format(DEFAULT_DATE_FORMAT),
      isPublicHoliday: leaveType.isPublicHoliday,
      isSpecialLeave: false
    };

    return createLeaveRequestDto;
  }

  private async addErrorMessageToWorksheetLeaveRequest(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    resultWorksheet: ExcelJS.Worksheet,
    customErrorMessage: string
  ) {
    const errorRow = worksheet.getRow(rowNumber);
    errorRow.getCell(10).value = RecordStatus.FAILED;
    errorRow.getCell(11).value = customErrorMessage;
    resultWorksheet.addRow(errorRow.values);
  }

  private async addEmployeeLeaveRequestTemplateToWorksheet(
    workbook: ExcelJS.Workbook
  ) {
    const sheetName = 'Employee Leave Request';
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.addRow(EMPLOYEE_LEAVE_REQUEST_HEADERS);

    worksheet.columns.forEach((column) => {
      column.width = 30;
      column.alignment = HEADER_STYLE.alignment;
      column.font = HEADER_STYLE.font;
    });

    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.style = HEADER_STYLE;
    });
    //ADD: data validation to leave request type column
    const leaveTypes = await this.leaveTypeRepo.find();
    const leaveRequestTypeCell = worksheet.getCell('D2');
    const leaveTypeOptions = leaveTypes
      .map(
        (leaveType: LeaveType) => leaveType.id + '-' + leaveType.leaveTypeName
      )
      .join(',');
    this.addDataValidationToCell(leaveRequestTypeCell, leaveTypeOptions);

    //ADD: data validation to duration type column
    const durationTypeCell = worksheet.getCell('E2');
    const leaveDurationTypes = Object.values(LeaveRequestDurationTypeEnEnum);
    const data = leaveDurationTypes
      .map(
        (leaveDurationType: LeaveRequestDurationTypeEnEnum) => leaveDurationType
      )
      .join(',');
    this.addDataValidationToCell(durationTypeCell, data);

    const options = ['TRUE', 'FALSE'].join(',');
    //ADD: data validation to is public holiday column
    const publicHolidayCell = worksheet.getCell('I2');
    this.addDataValidationToCell(publicHolidayCell, options);

    //ADD: data validation to is special leave column
    const specialLeaveCell = worksheet.getCell('J2');
    this.addDataValidationToCell(specialLeaveCell, options);
  }

  private addDataValidationToCell(cell: ExcelJS.Cell, data: string): void {
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${data}"`]
    };
  }
}
