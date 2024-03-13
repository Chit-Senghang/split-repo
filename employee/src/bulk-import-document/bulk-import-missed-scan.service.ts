import { join } from 'path';
import * as fs from 'fs';
import {
  dayJs,
  getCurrentDateTime
} from '../shared-resources/common/utils/date-utils';
import * as ExcelJS from 'exceljs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import { plainToInstance } from 'class-transformer';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { UtilityService } from '../utility/utility.service';
import { ReasonTemplateTypeEnum } from '../reason-template/common/ts/enum/type.enum';
import { ReasonTemplateRepository } from '../reason-template/repository/reason-template.repository';
import { IReasonTemplateRepository } from '../reason-template/repository/interface/reason-template.repository.interface';
import { DEFAULT_HOUR_MINUTE_FORMAT } from './../shared-resources/common/dto/default-date-format';
import { MissedScanRequestService } from './../attendance/missed-scan-request/missed-scan-request.service';
import { CreateMissedScanRequestDto } from './../attendance/missed-scan-request/dto/create-missed-scan-request.dto';
import { IBulkImportDocument } from './repository/interface/bulk-import-document.interface';
import { BulkImportBaseService } from './bulk-import-base.service';
import { MISSED_SCAN_HEADERS } from './constant/missed-scan-header.constant';
import { FileName } from './enum/file-name.enum';
import { RecordStatus } from './enum/record-status.enum';
import { BulkTypeEnum } from './enum/type.enum';

@Injectable()
export class ImportMissedScanService implements IBulkImportDocument {
  constructor(
    private readonly bulkImportBaseService: BulkImportBaseService,
    private readonly utilityService: UtilityService,
    private readonly missedScanRequestService: MissedScanRequestService,
    @Inject(ReasonTemplateRepository)
    private readonly reasonTemplateRepository: IReasonTemplateRepository
  ) {}

  async import(fileName: string, importStartTime: string): Promise<void> {
    const workbook: ExcelJS.Workbook =
      await this.bulkImportBaseService.readExcel(fileName);
    const path: string = this.utilityService.createFilePath(
      `${FileName.BULK_TIME_RESULT}.xlsx`,
      'templates'
    );

    // Get first worksheet from excel file
    const worksheet = workbook.getWorksheet('Missed Scan');
    const actualRowCount = worksheet.actualRowCount;
    const reasonTemplate = await this.reasonTemplateRepository.findOne({
      where: {
        type: ReasonTemplateTypeEnum.OTHER
      }
    });
    const resultWorkbook = await this.addMissedScanOutputTemplate();
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
        const scanTime = this.bulkImportBaseService.getValueFromWorksheetByCell(
          worksheet,
          rowNumber,
          'D'
        );

        // Create DTO
        const employeeMissedScanRequestDto: CreateMissedScanRequestDto = {
          requestDate: dayJs(requestDate).utc().format(DEFAULT_DATE_FORMAT),
          scanTime: dayJs(scanTime).utc().format(DEFAULT_HOUR_MINUTE_FORMAT),
          employeeId: employee.id,
          reasonTemplateId: reasonTemplate.id,
          status: StatusEnum.ACTIVE,
          documentIds: [],
          reason: 'Import Missed Scan'
        };
        const entity = plainToInstance(
          CreateMissedScanRequestDto,
          employeeMissedScanRequestDto
        );
        await this.bulkImportBaseService.handleDtoErrorMessage(entity);

        // Save to missed scan
        await this.missedScanRequestService.create(
          employeeMissedScanRequestDto
        );
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
        type: BulkTypeEnum.MISSED_SCAN
      });
      await this.bulkImportBaseService.insertFileIntoMedia(bulkImport, path);
    }
  }

  async download(): Promise<{
    mimeType: string;
    fileName: string;
    file: string;
  }> {
    // create workbook
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const fileName = 'MissedScan.xlsx';

    // add worksheet
    const worksheet: ExcelJS.Worksheet = workbook.addWorksheet('Missed Scan');
    this.bulkImportBaseService.addHeader(worksheet, MISSED_SCAN_HEADERS);
    this.bulkImportBaseService.addStyleHeader(worksheet);

    // create file and path
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
    errorRow.getCell(5).value = RecordStatus.FAILED;
    errorRow.getCell(6).value = customErrorMessage;
    resultWorksheet.addRow(errorRow.values);
  }

  private async addMissedScanOutputTemplate() {
    // create workbook and worksheet
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Failed Records');

    // add header and style
    await this.bulkImportBaseService.addHeader(worksheet, MISSED_SCAN_HEADERS);
    await this.bulkImportBaseService.addStyleHeader(worksheet);

    return workbook;
  }
}
