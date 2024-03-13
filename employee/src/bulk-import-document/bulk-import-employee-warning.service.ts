import * as fs from 'fs';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateTime
} from '../shared-resources/common/utils/date-utils';
import { plainToInstance } from 'class-transformer';
import { UtilityService } from '../utility/utility.service';
import { CodeTypesEnum } from '../key-value/ts/enums/permission.enum';
import { ReasonTemplate } from '../reason-template/entities/reason-template.entity';
import { ReasonTemplateTypeEnum } from '../reason-template/common/ts/enum/type.enum';
import { CodeValue } from '../key-value/entity';
import { CreateEmployeeWarningDto } from '../employee-warning/dto/create-employee-warning.dto';
import { EmployeeWarningService } from '../employee-warning/employee-warning.service';
import { IBulkImportDocument } from './repository/interface/bulk-import-document.interface';
import { BulkImportBaseService } from './bulk-import-base.service';
import {
  EMPLOYEE_WARNING_HEADERS,
  WARNING_TYPE_HEADERS
} from './constant/employee-warning-header.constant';
import { REASON_TEMPLATE_HEADERS } from './constant/reason-template-headers.constant';
import { CodeValueResponseDto } from './dto/code-value-response.dto';
import { FileName } from './enum/file-name.enum';
import { RecordStatus } from './enum/record-status.enum';
import { BulkTypeEnum } from './enum/type.enum';

@Injectable()
export class ImportEmployeeWarningService implements IBulkImportDocument {
  constructor(
    private readonly bulkImportBaseService: BulkImportBaseService,
    private readonly utilityService: UtilityService,
    @InjectRepository(ReasonTemplate)
    private readonly reasonTemplateRepo: Repository<ReasonTemplate>,
    @InjectRepository(CodeValue)
    private readonly codeValueRepo: Repository<CodeValue>,
    private readonly employeeWarningService: EmployeeWarningService
  ) {}

  async import(fileName: string, importStartTime: string): Promise<void> {
    //read file
    const workbook: ExcelJS.Workbook =
      await this.bulkImportBaseService.readExcel(fileName);

    //file path
    const path: string = this.utilityService.createFilePath(
      `${FileName.BULK_TIME_RESULT}.xlsx`,
      'templates'
    );

    //create workbook to store fail records
    const resultWorkbook = await this.createEmployeeWarningFailSheet();
    const resultWorksheet = resultWorkbook.getWorksheet('Failed Records');

    //get employee warning worksheet from excel file
    const worksheet = workbook.getWorksheet('Employee Warning');
    const actualRowCount = worksheet.actualRowCount;
    const reasonTemplate = await this.reasonTemplateRepo.findOne({
      where: { type: ReasonTemplateTypeEnum.OTHER }
    });

    //iterate value from cell and row
    let successCount = 0;
    let failureCount = 0;
    for (let rowNumber = 2; rowNumber <= actualRowCount; rowNumber++) {
      try {
        //get warning type
        const warningTypeName =
          this.bulkImportBaseService.getValueFromWorksheetByCell(
            worksheet,
            rowNumber,
            'E'
          );
        const warningType = await this.codeValueRepo.findOne({
          where: { value: warningTypeName }
        });
        //get warning date
        const warningDate =
          this.bulkImportBaseService.getValueFromWorksheetByCell(
            worksheet,
            rowNumber,
            'F'
          );
        //get employee
        const employee =
          await this.bulkImportBaseService.getEmployeeFromWorksheet(
            worksheet,
            rowNumber
          );
        //get warning title
        const warningTitle =
          this.bulkImportBaseService.getValueFromWorksheetByCell(
            worksheet,
            rowNumber,
            'D'
          );
        //create warning dto
        const createEmployeeWarningDto: CreateEmployeeWarningDto = {
          warningTypeId: warningType.id,
          warningDate: dayJs(warningDate).format(DEFAULT_DATE_FORMAT),
          employeeId: employee.id,
          warningTitle: warningTitle,
          reason: 'Import',
          documentIds: [],
          reasonTemplateId: reasonTemplate.id
        };
        const entity = plainToInstance(
          CreateEmployeeWarningDto,
          createEmployeeWarningDto
        );
        await this.bulkImportBaseService.handleDtoErrorMessage(entity);
        //insert to database
        await this.employeeWarningService.createEmployeeWarning(
          createEmployeeWarningDto
        );
        successCount++;
      } catch (error) {
        Logger.log(error);
        failureCount++;
        const errorMessage = this.bulkImportBaseService.handleError(error);
        this.addErrorMessageToWorksheetResignation(
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
      type: BulkTypeEnum.WARNING
    });

    await this.bulkImportBaseService.insertFileIntoMedia(bulkImport, path);
  }

  async download(): Promise<{
    mimeType: string;
    fileName: string;
    file: string;
  }> {
    //create workbook
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const fileName = 'EmployeeWarning.xlsx';

    //add worksheet
    await this.addWarningSheet(workbook, 'Employee Warning');
    await this.addReasonTemplateSheet(workbook, 'Reason Template');
    await this.addWarningTypeSheet(workbook, 'Warning Type');

    //create file and path
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

  private async addWarningSheet(
    workbook: ExcelJS.Workbook,
    worksheetName: string
  ): Promise<void> {
    const warningWorkSheet = workbook.addWorksheet(worksheetName);
    await this.bulkImportBaseService.addHeader(
      warningWorkSheet,
      EMPLOYEE_WARNING_HEADERS
    );
    await this.bulkImportBaseService.addStyleHeader(warningWorkSheet);
    const reasonTemplates: ReasonTemplate[] =
      await this.reasonTemplateRepo.find();
    warningWorkSheet.getCell('G2').dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [
        `"${reasonTemplates
          .map((reasonTemplate: CodeValueResponseDto) => reasonTemplate.name)
          .join(',')}"`
      ]
    };
    //add warning type options to worksheet
    const codeValues = await this.bulkImportBaseService.getCodeValueBaseOnType(
      CodeTypesEnum.WARNING_TYPE
    );
    warningWorkSheet.getCell('E2').dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [
        `"${codeValues
          .map((codeValue: CodeValueResponseDto) => codeValue.name)
          .join(',')}"`
      ]
    };
  }

  private async addWarningTypeSheet(
    workbook: ExcelJS.Workbook,
    worksheetName: string
  ): Promise<void> {
    const warningWorkSheet = workbook.addWorksheet(worksheetName);
    await this.bulkImportBaseService.addHeader(
      warningWorkSheet,
      WARNING_TYPE_HEADERS
    );
    //add value by worksheet
    const codeValues = await this.bulkImportBaseService.getCodeValueBaseOnType(
      CodeTypesEnum.WARNING_TYPE
    );
    if (codeValues?.length) {
      codeValues.forEach((codeValue) => {
        warningWorkSheet.addRow(codeValue);
      });
    }
    await this.bulkImportBaseService.addStyleHeader(warningWorkSheet);
  }

  private async addReasonTemplateSheet(
    workbook: ExcelJS.Workbook,
    worksheetName: string
  ): Promise<void> {
    const reasonWorksheet = workbook.addWorksheet(worksheetName);
    await this.bulkImportBaseService.addHeader(
      reasonWorksheet,
      REASON_TEMPLATE_HEADERS
    );
    const reasonTemplates: ReasonTemplate[] =
      await this.reasonTemplateRepo.find();
    if (reasonTemplates?.length) {
      reasonTemplates.forEach((reasonTemplate) => {
        reasonWorksheet.addRow(reasonTemplate);
      });
    }
    await this.bulkImportBaseService.addStyleHeader(reasonWorksheet);
  }

  private async createEmployeeWarningFailSheet() {
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Failed Records');

    await this.bulkImportBaseService.addHeader(
      worksheet,
      REASON_TEMPLATE_HEADERS
    );

    await this.bulkImportBaseService.addStyleHeader(worksheet);

    return workbook;
  }

  private async addErrorMessageToWorksheetResignation(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    resultWorksheet: ExcelJS.Worksheet,
    customErrorMessage: string
  ) {
    const errorRow = worksheet.getRow(rowNumber);
    errorRow.getCell(6).value = RecordStatus.FAILED;
    errorRow.getCell(7).value = customErrorMessage;
    resultWorksheet.addRow(errorRow.values);
  }
}
