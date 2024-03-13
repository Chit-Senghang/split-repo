import * as fs from 'fs';
import { Readable } from 'stream';
import { Inject, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { validate } from 'class-validator';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { QueryFailedError } from 'typeorm';
import { DEFAULT_DATE_TIME_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { Express } from 'express';
import { plainToInstance } from 'class-transformer';
import { UtilityService } from '../utility/utility.service';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { MediaService } from '../media/media.service';
import { CodeTypesEnum } from '../key-value/ts/enums/permission.enum';
import { CodeValue } from '../key-value/entity';
import { CodeValueRepository } from '../key-value/repository/code-value.repository';
import { ICodeValueRepository } from '../key-value/repository/interface/code-value.interface';
import { ReasonTemplateService } from '../reason-template/reason-template.service';
import { BulkTypeEnum } from './enum/type.enum';
import { BulkImportDocument } from './entities/bulk-import-document.entity';
import { BulkImportDocumentRepository } from './repository/bulk-import-document.repository';
import { IBulkImportDocumentRepository } from './repository/interface/bulk-import-document.repository.interface';
import { FileName } from './enum/file-name.enum';
import { CodeValueResponseDto } from './dto/code-value-response.dto';
import { CODE_VALUE_SELECTED_FIELDS } from './constant/code-value-selected-fields.constant';
import { HEADER_STYLE } from './constant/header-style.constant';

type IBulkImport = {
  totalRecord: number;
  failureCount: number;
  successCount: number;
  importEndTime: string;
  importStartTime: string;
  isCompleted: boolean;
  type: BulkTypeEnum;
};

@Injectable()
export class BulkImportBaseService {
  constructor(
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    private readonly reasonTemplateService: ReasonTemplateService,
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(BulkImportDocumentRepository)
    private readonly bulkImportDocumentRepo: IBulkImportDocumentRepository,
    @Inject(CodeValueRepository)
    private readonly codeValueRepository: ICodeValueRepository
  ) {}

  async readExcel(fileName: string): Promise<ExcelJS.Workbook> {
    const filePath: string = this.utilityService.createFilePath(
      fileName,
      'templates'
    );
    return await new ExcelJS.Workbook().xlsx.readFile(filePath);
  }

  async getEmployeeFromWorksheet(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number
  ): Promise<Employee> {
    const accountNo = this.getValueFromWorksheetByCell(
      worksheet,
      rowNumber,
      'B'
    );
    const employee =
      await this.employeeRepository.getEmployeeByAccountNumberForImport(
        accountNo
      );
    if (!employee) {
      throw new ResourceNotFoundException(`ACCOUNT NO ${accountNo} not found.`);
    }
    return employee;
  }

  getValueFromWorksheetByCell(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    column: string | number
  ): string {
    return worksheet.getCell(`${column}${rowNumber}`).value.toString();
  }

  async handleDtoErrorMessage(entity: any) {
    const errors = await validate(entity);
    let errorMessage: any;
    if (errors.length) {
      for (const data of errors[0].children) {
        for (const temp of data.children) {
          errorMessage = temp.constraints;
        }
      }

      const constrains = Object.values(errors[0]?.constraints ?? errorMessage);
      constrains.forEach((constrain) => (errorMessage = constrain));
    }
    if (errorMessage) {
      throw new ResourceBadRequestException(errorMessage);
    }
  }

  handleError(error: any) {
    let customErrorMessage: any;
    if (error instanceof QueryFailedError) {
      customErrorMessage = this.customDuplicateErrorMessage(
        error.driverError.detail
      );
    } else if (error instanceof ResourceBadRequestException) {
      customErrorMessage = error.getError();
      customErrorMessage =
        customErrorMessage[0]?.message ?? customErrorMessage[0]?.path;
    } else if (error instanceof ResourceConflictException) {
      customErrorMessage = error.getError();
      if (customErrorMessage[0]?.path) {
        if (customErrorMessage[0]?.path?.includes('contact')) {
          customErrorMessage[0].path = 'contactNumber';
        }
        if (customErrorMessage?.length) {
          customErrorMessage = customErrorMessage[0].path
            .replace(/([A-Z])/g, ' $1')
            .toUpperCase();

          customErrorMessage = customErrorMessage + ' Data already exits.';
        }
      } else {
        customErrorMessage = error.getError();
        customErrorMessage = customErrorMessage[0]?.message;
      }
    } else if (error instanceof ResourceNotFoundException) {
      customErrorMessage = error.getError();
      customErrorMessage = customErrorMessage[0].message;
    } else {
      if (error instanceof TypeError) {
        customErrorMessage = error.message;
      } else {
        customErrorMessage = error?.getError();
        customErrorMessage =
          customErrorMessage[0]?.message ?? customErrorMessage[0]?.path;
      }
    }

    return customErrorMessage;
  }

  async createBulk(
    createBulkImportDto: IBulkImport
  ): Promise<BulkImportDocument> {
    const bulkImportDocument: BulkImportDocument =
      this.bulkImportDocumentRepo.create({
        totalRecord: createBulkImportDto.totalRecord,
        failureCount: createBulkImportDto.failureCount,
        successCount: createBulkImportDto.successCount,
        isCompleted: createBulkImportDto.isCompleted,
        type: createBulkImportDto.type,
        importEndTime: dayJs(createBulkImportDto.importEndTime)
          .utc(true)
          .format(DEFAULT_DATE_TIME_FORMAT),
        importStartTime: dayJs(createBulkImportDto.importStartTime)
          .utc(true)
          .format(DEFAULT_DATE_TIME_FORMAT)
      });

    return await this.bulkImportDocumentRepo.save(bulkImportDocument);
  }

  async insertFileIntoMedia(bulkImport: BulkImportDocument, path: any) {
    const originalFilePath = this.utilityService.createFilePath(
      `${FileName.BULK_FILE_INPUT}.xlsx`,
      'templates'
    );

    const originalBuffer = fs.readFileSync(originalFilePath);

    const originalFile = await this.bufferAsMulterFile(
      originalBuffer,
      `${FileName.BULK_FILE_INPUT}.xlsx`
    );

    await this.mediaService.create(
      {
        entityId: bulkImport.id.toString(),
        entityType: MediaEntityTypeEnum.BULK_IMPORT_INPUT
      },
      originalFile
    );

    const resultBuffer = fs.readFileSync(path);
    const resultFile = await this.bufferAsMulterFile(
      resultBuffer,
      `${FileName.BULK_TIME_RESULT}.xlsx`
    );

    await this.mediaService.create(
      {
        entityId: bulkImport.id.toString(),
        entityType: MediaEntityTypeEnum.BULK_IMPORT_RESULT
      },
      resultFile
    );
  }

  async getCodeValueBaseOnType(
    codeType: CodeTypesEnum
  ): Promise<CodeValueResponseDto[]> {
    const codeValues: CodeValue[] = await this.codeValueRepository.find({
      where: { code: { code: codeType } },
      relations: { code: true },
      select: CODE_VALUE_SELECTED_FIELDS
    });

    return plainToInstance(CodeValueResponseDto, codeValues);
  }

  async bufferAsMulterFile(
    buffer: Buffer,
    filename: string
  ): Promise<Express.Multer.File> {
    return {
      fieldname: 'buffer',
      originalname: filename,
      encoding: '7bit',
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
      size: buffer.length,
      destination: '',
      filename,
      path: '',
      stream: new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        }
      })
    } as Express.Multer.File;
  }

  customDuplicateErrorMessage = (msg: string) => {
    if (msg) {
      const splitMessage = msg.replace(/["("|")"]/g, '').split(/[\s|=]/g);

      return (
        splitMessage[1] + ' ' + splitMessage.slice(2).join(' ').replace('.', '')
      );
    }
  };

  async addEmployeeOutputTemplate(headers: string[]) {
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Failed Records');
    this.addHeader(worksheet, headers);
    this.addStyleHeader(worksheet);
    return workbook;
  }

  async getReasonTemplates() {
    return await this.reasonTemplateService.getTemplates();
  }

  async addStyleHeader(worksheet: ExcelJS.Worksheet): Promise<void> {
    worksheet.columns.forEach((column) => {
      column.width = 30;
      column.alignment = HEADER_STYLE.alignment;
      column.font = HEADER_STYLE.font;
    });

    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.style = HEADER_STYLE;
    });
  }

  async addHeader(worksheet: ExcelJS.Worksheet, headersConstant: string[]) {
    const headers = Object.values(headersConstant);
    const columns = [];
    for (let i = 0; i < headers.length; i++) {
      columns.push({
        header: headers[i],
        key: headers[i].toLowerCase().replace(' ', '_')
      });
    }
    worksheet.columns = columns;
    return worksheet;
  }
}
