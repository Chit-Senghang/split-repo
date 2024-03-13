import * as fsPromise from 'fs/promises';
import { getCurrentDateTime } from '../shared-resources/common/utils/date-utils';
import { Between, DataSource } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { Inject } from '@nestjs/common';
import { convertDateRangeToFromDateToDate } from '../shared-resources/utils/validate-date-format';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { IFile } from '../media/common/ts/interfaces/file.interface';
import { UtilityService } from '../utility/utility.service';
import { FileExtensionValidationPipe } from '../media/common/validators/file-extension.validator';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { GrpcService } from '../grpc/grpc.service';
import { BulkImportDayOffService } from './bulk-import-dayoff.service';
import { ImportMissedScanService } from './bulk-import-missed-scan.service';
import { ImportEmployeeResignationService } from './bulk-import-employee-resignation.service';
import { BulkTypeEnum } from './enum/type.enum';
import { FileName } from './enum/file-name.enum';
import { BulkImportEmployeeService } from './bulk-import-employee.service';
import { BulkImportBodyDto } from './dto/bulk-import-body.dto';
import { BulkImportDocument } from './entities/bulk-import-document.entity';
import { BulkImportDocumentRepository } from './repository/bulk-import-document.repository';
import { IBulkImportDocumentRepository } from './repository/interface/bulk-import-document.repository.interface';
import { BulkImportDocumentPaginationDto } from './dto/bulk-import-document-pagination.dto';
import { BulkImportLeaveRequest } from './bulk-import-leave-request.service';
import { ImportEmployeeWarningService } from './bulk-import-employee-warning.service';

export class BulkImportDocumentService {
  constructor(
    private readonly importEmployeeResignationService: ImportEmployeeResignationService,
    private readonly importEmployeeWarningService: ImportEmployeeWarningService,
    private readonly importEmployeeService: BulkImportEmployeeService,
    private readonly importLeaveRequest: BulkImportLeaveRequest,
    private readonly importMissedScanService: ImportMissedScanService,
    private readonly dataSource: DataSource,
    private readonly utilityService: UtilityService,
    private readonly validateFileService: FileExtensionValidationPipe,
    private readonly grpcService: GrpcService,
    private readonly bulkImportDayOffService: BulkImportDayOffService,
    @Inject(BulkImportDocumentRepository)
    private readonly bulkImportDocumentRepository: IBulkImportDocumentRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository
  ) {}

  async import(file: any, importDto: BulkImportBodyDto) {
    const importStartTime: string = getCurrentDateTime();
    const imagePaths: string[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let excelFile: IFile;

    try {
      if (!file) {
        throw new ResourceNotFoundException(
          `Please add your attachment file(s)`
        );
      }
      await this.utilityService.validateFileSize(file.size);
      await this.validateFileService.transform(file.originalname);
      const fileName = FileName.BULK_FILE_INPUT.toString();

      excelFile = {
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
      );

      await fsPromise.writeFile(filePath, excelFile.buffer, 'binary');

      imagePaths.push(filePath);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      for (const imagePath of imagePaths) {
        await fsPromise.unlink(imagePath);
      }
    } finally {
      await queryRunner.release();
    }
    switch (importDto.entityType) {
      case BulkTypeEnum.EMPLOYEE_RESIGNATION:
        return await this.importEmployeeResignationService.import(
          excelFile.name,
          importStartTime
        );
      case BulkTypeEnum.EMPLOYEE:
        return await this.importEmployeeService.import(
          excelFile.name,
          importStartTime
        );
      case BulkTypeEnum.LEAVE_REQUEST:
        return await this.importLeaveRequest.import(
          excelFile.name,
          importStartTime
        );
      case BulkTypeEnum.DAY_OFF_REQUEST:
        return await this.bulkImportDayOffService.import(
          excelFile.name,
          importStartTime
        );
      case BulkTypeEnum.MISSED_SCAN:
        return await this.importMissedScanService.import(
          excelFile.name,
          importStartTime
        );
      case BulkTypeEnum.WARNING:
        return await this.importEmployeeWarningService.import(
          excelFile.name,
          importStartTime
        );
    }
  }

  async download(entityType: BulkTypeEnum, companyStructureId: number) {
    switch (entityType) {
      case BulkTypeEnum.EMPLOYEE:
        return await this.importEmployeeService.download(companyStructureId);
      case BulkTypeEnum.EMPLOYEE_RESIGNATION:
        return await this.importEmployeeResignationService.download();
      case BulkTypeEnum.LEAVE_REQUEST:
        return await this.importLeaveRequest.download();
      case BulkTypeEnum.DAY_OFF_REQUEST:
        return await this.bulkImportDayOffService.download();
      case BulkTypeEnum.MISSED_SCAN:
        return await this.importMissedScanService.download();
      case BulkTypeEnum.WARNING:
        return await this.importEmployeeWarningService.download();
    }
  }

  async findAll(pagination: BulkImportDocumentPaginationDto) {
    let fromDate: any;
    let toDate: any;
    if (pagination.fromImportStartTime || pagination.toImportEndTime) {
      if (pagination.fromImportStartTime && !pagination.toImportEndTime) {
        throw new ResourceNotFoundException(
          `You need to add query fromImportStartTime and toImportEndTime`
        );
      }
      if (pagination.toImportEndTime && !pagination.fromImportStartTime) {
        throw new ResourceNotFoundException(
          `You need to add query fromDate and toDate`
        );
      }
      const result = convertDateRangeToFromDateToDate({
        dateRange: {
          fromDate: pagination.fromImportStartTime,
          toDate: pagination.toImportEndTime
        }
      });

      fromDate = result.fromDate;
      toDate = result.toDate;
    }

    const bulkImports =
      await this.bulkImportDocumentRepository.findAllWithPagination(
        pagination,
        [],
        {
          where: {
            type: pagination.entityType,
            importStartTime:
              pagination.fromImportStartTime && pagination.toImportEndTime
                ? Between(fromDate, toDate)
                : null
          }
        }
      );

    const result = await Promise.all(
      bulkImports.data.map(async (bulkImport: BulkImportDocument) => {
        if (bulkImport.createdBy) {
          const user = await this.grpcService.getUserById(bulkImport.createdBy);
          const employee = await this.employeeRepository.findOne({
            where: {
              userId: bulkImport.createdBy,
              positions: { isMoved: false }
            },
            select: { id: true, displayFullNameEn: true }
          });

          if (employee || user) {
            return {
              ...bulkImport,
              createdBy: user,
              employee
            };
          }

          return {
            ...bulkImport
          };
        }
      })
    );
    return {
      data: result,
      totalCount: bulkImports.totalCount
    };
  }

  async exportFile(
    pagination: BulkImportDocumentPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.IMPORT_EMPLOYEE,
      exportFileDto,
      data
    );
  }

  async getSupportedUploadEntity() {
    return Object.values(BulkTypeEnum).map((type: string) => {
      return { template: type };
    });
  }
}
