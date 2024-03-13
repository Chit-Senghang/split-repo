import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, Raw } from 'typeorm';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_TIME_FORMAT
} from '../shared-resources/common/dto/default-date-format';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { AuthenticationProto } from '../shared-resources/proto';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { AuditLoggingPaginationDto } from './dto/audit-logging-pagination.dto';
import { AuditLog } from './entities/audit-logging.entity';

@Injectable()
export class AuditLoggingService {
  private readonly auditLogging = 'AUDIT LOGGING';

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLoggingRepo: Repository<AuditLog>
  ) {}

  async exportFile(
    pagination: AuditLoggingPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.AUDIT_LOG,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: AuditLoggingPaginationDto
  ): Promise<PaginationResponse<AuditLog>> {
    if (pagination.orderBy) {
      if (pagination.orderBy === 'createdBy') {
        pagination.orderBy = 'createdBy.username';
      }
    }

    const fromDate = pagination.fromDate;
    const toDate = pagination.toDate;
    const fromTime = pagination.fromTime;
    const toTime = pagination.toTime;
    let searchCondition: any;

    if (fromDate && toDate) {
      // format date
      const fromDateFormatted = dayJs(fromDate, DEFAULT_DATE_FORMAT).format(
        DEFAULT_DATE_FORMAT
      );

      const toDateFormatted = dayJs(toDate, DEFAULT_DATE_FORMAT).format(
        DEFAULT_DATE_FORMAT
      );

      // search condition for date range
      searchCondition = Raw(
        (alias) =>
          `TO_CHAR(${alias}, 'YYYY-MM-DD') BETWEEN '${fromDateFormatted}' AND '${toDateFormatted}'`
      );
    }

    if (fromTime && toTime) {
      // format time
      const fromTimeFormatted = dayJs(fromTime, DEFAULT_TIME_FORMAT).format(
        DEFAULT_TIME_FORMAT
      );

      const toTimeFormatted = dayJs(toTime, DEFAULT_TIME_FORMAT).format(
        DEFAULT_TIME_FORMAT
      );

      // search condition for time range
      searchCondition = Raw(
        (alias) =>
          `TO_CHAR(${alias}, 'HH24:MI:SS') BETWEEN '${fromTimeFormatted}' AND '${toTimeFormatted}'`
      );
    }

    if (fromDate && toDate && fromTime && toTime) {
      // combine fromDate and fromTime to create fromDateTime and format
      const fromDateTimeFormatted = dayJs(
        fromDate + ' ' + fromTime,
        DEFAULT_DATE_TIME_FORMAT
      ).format(DEFAULT_DATE_TIME_FORMAT);

      // combine toDate and toTime to create toDateTime and format
      const toDateTimeFormatted = dayJs(
        toDate + ' ' + toTime,
        DEFAULT_DATE_TIME_FORMAT
      ).format(DEFAULT_DATE_TIME_FORMAT);

      // search condition for date-time range
      searchCondition = Raw(
        (alias) =>
          `TO_CHAR(${alias}, 'YYYY-MM-DD HH24:MI:SS') BETWEEN '${fromDateTimeFormatted}' AND '${toDateTimeFormatted}'`
      );
    }

    return GetPagination(this.auditLoggingRepo, pagination, [], {
      where: {
        requestMethod: pagination.requestMethod,
        requestUrl:
          pagination.requestUrl && ILike(`%${pagination.requestUrl}%`),
        createdAt: searchCondition,
        createdBy: pagination.userId && {
          id: Number(pagination.userId)
        }
      },
      relation: {
        updatedBy: true,
        createdBy: true
      },
      select: {
        updatedBy: {
          id: true,
          username: true
        },
        createdBy: {
          id: true,
          username: true
        }
      }
    });
  }

  async findOne(id: number): Promise<AuditLog> {
    const auditLogging = this.auditLoggingRepo.findOneBy({
      id
    });
    if (!auditLogging) {
      throw new ResourceNotFoundException(this.auditLogging, id);
    }
    return auditLogging;
  }

  async create(
    createAuditLoggingDto: AuthenticationProto.createAuditLoggingDto
  ) {
    const auditLogging = this.auditLoggingRepo.create({
      requestJson: createAuditLoggingDto.requestJson,
      requestMethod: createAuditLoggingDto.requestMethod,
      requestUrl: createAuditLoggingDto.requestUrl,
      ipAddress: createAuditLoggingDto.ipAddress,
      createdBy: { id: createAuditLoggingDto.createdBy }
    });
    return await this.auditLoggingRepo.save(auditLogging);
  }

  async createAuditLog(
    createAuditLoggingDto: AuthenticationProto.createAuditLoggingDto
  ) {
    const auditLogging = this.auditLoggingRepo.create({
      requestJson: createAuditLoggingDto.requestJson,
      requestMethod: createAuditLoggingDto.requestMethod,
      requestUrl: createAuditLoggingDto.requestUrl,
      ipAddress: createAuditLoggingDto.ipAddress,
      createdBy: { id: createAuditLoggingDto.createdBy }
    });
    const data = await this.auditLoggingRepo.save(auditLogging);
    return { auditLoggingId: data.id };
  }
}
