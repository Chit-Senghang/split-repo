import { join } from 'path';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import { plainToInstance } from 'class-transformer';
import { Logger, Injectable } from '@nestjs/common';
import { getCurrentDateTime } from '../shared-resources/common/utils/date-utils';
import { UtilityService } from '../utility/utility.service';
import { CreateDayOffRequestDto } from '../leave/day-off-request/dto/create-day-off-request.dto';
import { DayOffRequestService } from './../leave/day-off-request/day-off-request.service';
import { BulkImportBaseService } from './bulk-import-base.service';
import { IBulkImportDocument } from './repository/interface/bulk-import-document.interface';
import { FileName } from './enum/file-name.enum';
import { BulkTypeEnum } from './enum/type.enum';
import { RecordStatus } from './enum/record-status.enum';
import { DAY_OFF_REQUEST_HEADERS } from './constant/day-off-request-header.constant';

@Injectable()
export class BulkImportDayOffService implements IBulkImportDocument {
  constructor(
    private readonly bulkImportBaseService: BulkImportBaseService,
    private readonly utilityService: UtilityService,
    private readonly dayOffRequestService: DayOffRequestService
  ) {}

  async import(fileName: string, importStartTime: string): Promise<void> {
    const workbook: ExcelJS.Workbook =
      await this.bulkImportBaseService.readExcel(fileName);
    const path: string = this.utilityService.createFilePath(
      `${FileName.BULK_TIME_RESULT}.xlsx`,
      'templates'
    );

    // Get first worksheet from excel file
    const worksheet = workbook.getWorksheet('Day-Off-Request');
    const actualRowCount = worksheet.actualRowCount;
    const resultWorkbook = await this.addDayOffOutputTemplate();
    let successCount = 0;
    let failureCount = 0;
    for (let rowNumber = 2; rowNumber <= actualRowCount; rowNumber++) {
      try {
        const employee =
          await this.bulkImportBaseService.getEmployeeFromWorksheet(
            worksheet,
            rowNumber
          );
        const requestDate =
          this.bulkImportBaseService.getValueFromWorksheetByCell(
            worksheet,
            rowNumber,
            'C'
          );

        // Create DTO
        const datesArray: string[] = requestDate.split(',');
        const employeeDayOffRequestDto: CreateDayOffRequestDto = {
          employeeId: employee.id,
          dayOffDate: datesArray as []
        };
        const entity = plainToInstance(
          CreateDayOffRequestDto,
          employeeDayOffRequestDto
        );
        await this.bulkImportBaseService.handleDtoErrorMessage(entity);

        // Save to day-off
        await this.dayOffRequestService.create(employeeDayOffRequestDto);
        successCount++;
      } catch (error) {
        Logger.error(error);
        failureCount++;
        const resultWorksheet = resultWorkbook.getWorksheet('Failed Records');
        const errorMessage = this.bulkImportBaseService.handleError(error);
        this.addErrorMessageToMissedScan(
          worksheet,
          rowNumber,
          resultWorksheet,
          errorMessage
        );
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
        type: BulkTypeEnum.DAY_OFF_REQUEST
      });
      await this.bulkImportBaseService.insertFileIntoMedia(bulkImport, path);
    }
  }

  async download(): Promise<{
    mimeType: string;
    fileName: string;
    file: string;
  }> {
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const fileName = 'DayOffRequest.xlsx';

    // add worksheet
    const worksheet: ExcelJS.Worksheet =
      workbook.addWorksheet('Day-Off-Request');
    this.bulkImportBaseService.addHeader(worksheet, DAY_OFF_REQUEST_HEADERS);
    this.bulkImportBaseService.addStyleHeader(worksheet);
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

  private async addErrorMessageToMissedScan(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    resultWorksheet: ExcelJS.Worksheet,
    customErrorMessage: string
  ) {
    const errorRow = worksheet.getRow(rowNumber);
    errorRow.getCell(4).value = RecordStatus.FAILED;
    errorRow.getCell(5).value = customErrorMessage;
    resultWorksheet.addRow(errorRow.values);
  }

  private async addDayOffOutputTemplate() {
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Failed Records');
    worksheet.addRow(DAY_OFF_REQUEST_HEADERS);

    // add header and style
    await this.bulkImportBaseService.addHeader(
      worksheet,
      DAY_OFF_REQUEST_HEADERS
    );
    await this.bulkImportBaseService.addStyleHeader(worksheet);
    return workbook;
  }

  private async addHeader(workbook: ExcelJS.Workbook) {
    const worksheet: ExcelJS.Worksheet =
      workbook.addWorksheet('Day-Off-Request');
    worksheet.addRow(DAY_OFF_REQUEST_HEADERS);

    // add header and style
    await this.bulkImportBaseService.addHeader(
      worksheet,
      DAY_OFF_REQUEST_HEADERS
    );
    await this.bulkImportBaseService.addStyleHeader(worksheet);
  }
}
