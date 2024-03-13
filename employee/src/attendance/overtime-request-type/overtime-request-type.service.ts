import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { GetPagination } from '../../shared-resources/utils/pagination-query.common';
import { ResourceNotFoundException } from '../../shared-resources/exception/resource-not-found.exception';
import { overtimeRequestTypeConstraint } from '../../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from '../../shared-resources/common/utils/handle-resource-conflict-exception';
import { UpdateOvertimeRequestTypeDto } from './dto/update-overtime-request-type.dto';
import {
  OvertimeRequestType,
  overtimeRequestTypeSearchableColumns
} from './entities/overtime-request-type.entity';
import { PaginationQueryOvertimeRequestTypeDto } from './dto/pagination-query-overtime-request-type.dto';
import { DataTableNameEnum } from './../../shared-resources/export-file/common/enum/data-table-name.enum';

@Injectable()
export class OvertimeRequestTypeService {
  private readonly OVER_TIME_REQUEST_TYPE = 'overtime request type';

  constructor(
    @InjectRepository(OvertimeRequestType)
    private readonly overtimeRequestTypeRepo: Repository<OvertimeRequestType>
  ) {}

  findAll(pagination: PaginationQueryOvertimeRequestTypeDto) {
    return GetPagination(
      this.overtimeRequestTypeRepo,
      pagination,
      overtimeRequestTypeSearchableColumns,
      {
        where: { percentagePerHour: pagination.percentagePerHour }
      }
    );
  }

  async exportFile(
    pagination: PaginationQueryOvertimeRequestTypeDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.OVERTIME_REQUEST_TYPE,
      exportFileDto,
      data
    );
  }

  async findOne(id: number): Promise<OvertimeRequestType> {
    const overtimeRequestType: OvertimeRequestType =
      await this.overtimeRequestTypeRepo.findOne({
        where: {
          id
        }
      });
    if (!overtimeRequestType) {
      throw new ResourceNotFoundException(this.OVER_TIME_REQUEST_TYPE, id);
    }
    return overtimeRequestType;
  }

  async update(
    id: number,
    updateOvertimeRequestTypeDto: UpdateOvertimeRequestTypeDto
  ): Promise<OvertimeRequestType & UpdateOvertimeRequestTypeDto> {
    try {
      const overtimeRequestType = await this.findOne(id);
      return await this.overtimeRequestTypeRepo.save(
        Object.assign(overtimeRequestType, updateOvertimeRequestTypeDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        overtimeRequestTypeConstraint,
        updateOvertimeRequestTypeDto
      );
    }
  }
}
