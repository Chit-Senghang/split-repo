import { join } from 'path';
import * as fs from 'fs';
import { plainToInstance } from 'class-transformer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateTime
} from '../shared-resources/common/utils/date-utils';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import { UtilityService } from '../utility/utility.service';
import { CreateEmployeeResignationDto } from '../employee-resignation/dto/create-employee-resignation.dto';
import { ReasonTemplateTypeEnum } from '../reason-template/common/ts/enum/type.enum';
import { EmployeeResignationService } from '../employee-resignation/employee-resignation.service';
import { ReasonTemplateRepository } from '../reason-template/repository/reason-template.repository';
import { IReasonTemplateRepository } from '../reason-template/repository/interface/reason-template.repository.interface';
import { CodeValueRepository } from '../key-value/repository/code-value.repository';
import { ICodeValueRepository } from '../key-value/repository/interface/code-value.interface';
import { CodeTypesEnum } from '../key-value/ts/enums/permission.enum';
import { FileName } from './enum/file-name.enum';
import { BulkTypeEnum } from './enum/type.enum';
import { HEADER_STYLE } from './constant/header-style.constant';
import { EMPLOYEE_RESIGNATION_HEADERS } from './constant/employee-resignation-header.constant';
import { RecordStatus } from './enum/record-status.enum';
import { BulkImportBaseService } from './bulk-import-base.service';
import { IBulkImportDocument } from './repository/interface/bulk-import-document.interface';
import { CodeValueResponseDto } from './dto/code-value-response.dto';

@Injectable()
export class ImportEmployeeResignationService implements IBulkImportDocument {
  constructor(
    private readonly bulkImportBaseService: BulkImportBaseService,
    private readonly utilityService: UtilityService,
    private readonly employeeResignationService: EmployeeResignationService,
    @Inject(ReasonTemplateRepository)
    private readonly reasonTemplateRepository: IReasonTemplateRepository,
    @Inject(CodeValueRepository)
    private readonly codeValueRepo: ICodeValueRepository
  ) {}

  async download(): Promise<{
    mimeType: string;
    fileName: string;
    file: string;
  }> {
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const fileName = 'EmployeeResignation.xlsx';
    await this.addEmployeeResignationTemplateToWorksheet(workbook);
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

  async import(fileName: string, importStartTime: string): Promise<void> {
    const workbook: ExcelJS.Workbook =
      await this.bulkImportBaseService.readExcel(fileName);

    const path: string = this.utilityService.createFilePath(
      `${FileName.BULK_TIME_RESULT}.xlsx`,
      'templates'
    );

    const resultWorkbook =
      await this.bulkImportBaseService.addEmployeeOutputTemplate(
        EMPLOYEE_RESIGNATION_HEADERS
      );

    const resultWorksheet = resultWorkbook.getWorksheet('Failed Records');

    // get first worksheet from excel file
    const worksheet = workbook.getWorksheet('Employee Resignation');
    const actualRowCount = worksheet.actualRowCount;
    const reasonTemplate = await this.reasonTemplateRepository.findOne({
      where: { type: ReasonTemplateTypeEnum.OTHER }
    });
    let successCount = 0;
    let failureCount = 0;
    for (let rowNumber = 2; rowNumber <= actualRowCount; rowNumber++) {
      try {
        const employee =
          await this.bulkImportBaseService.getEmployeeFromWorksheet(
            worksheet,
            rowNumber
          );
        const resignDate =
          this.bulkImportBaseService.getValueFromWorksheetByCell(
            worksheet,
            rowNumber,
            'D'
          );

        const resignName =
          this.bulkImportBaseService.getValueFromWorksheetByCell(
            worksheet,
            rowNumber,
            'E'
          );

        const resignType = await this.codeValueRepo.findOne({
          where: { value: resignName }
        });

        const employeeResignationDto: CreateEmployeeResignationDto = {
          resignTypeId: resignType.id,
          resignDate: dayJs(resignDate).format(DEFAULT_DATE_FORMAT),
          status: StatusEnum.ACTIVE,
          reason: 'Import',
          documentIds: [],
          reasonTemplateId: reasonTemplate?.id
        };

        const entity = plainToInstance(
          CreateEmployeeResignationDto,
          employeeResignationDto
        );
        await this.bulkImportBaseService.handleDtoErrorMessage(entity);

        await this.employeeResignationService.create(
          employeeResignationDto,
          employee.id,
          true
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
      type: BulkTypeEnum.EMPLOYEE_RESIGNATION
    });

    await this.bulkImportBaseService.insertFileIntoMedia(bulkImport, path);
  }

  // ==================== [Private block] ====================
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

  private async addEmployeeResignationTemplateToWorksheet(
    workbook: ExcelJS.Workbook
  ) {
    const sheetName = 'Employee Resignation';
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.addRow(EMPLOYEE_RESIGNATION_HEADERS);

    worksheet.columns.forEach((column) => {
      column.width = 30;
      column.alignment = HEADER_STYLE.alignment;
      column.font = HEADER_STYLE.font;
    });

    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.style = HEADER_STYLE;
    });

    const cell = worksheet.getCell('E2');

    const resignTypes = await this.bulkImportBaseService.getCodeValueBaseOnType(
      CodeTypesEnum.RESIGNATION_TYPE
    );

    // add resign type options to worksheet
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [
        `"${resignTypes
          .map((resignType: CodeValueResponseDto) => resignType.name)
          .join(',')}"`
      ]
    };
  }
}
