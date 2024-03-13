import { Inject, Injectable } from '@nestjs/common';
import { FindOperator, Raw } from 'typeorm';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import {
  checkIsValidYearFormat,
  validateDateTime
} from '../../shared-resources/utils/validate-date-format';
import {
  DEFAULT_MONTH_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
import { dayJs } from '../../shared-resources/common/utils/date-utils';
import { DataTableNameEnum } from './../../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from './../../shared-resources/common/utils/handle-resource-conflict-exception';
import { publicHolidayConstraint } from './../../shared-resources/ts/constants/resource-exception-constraints';
import { CreatePublicHolidayDto } from './dto/create-public-holiday.dto';
import { UpdatePublicHolidayDto } from './dto/update-public-holiday.dto';
import {
  PublicHoliday,
  PublicHolidaySearchableColumns
} from './entities/public-holiday.entity';
import { PaginationQueryPublicHolidayDto } from './dto/pagination-query-public-holiday.dto';
import { IPublicHolidayRepository } from './repository/interface/public-holiday.repository.interface';
import { PublicHolidayRepository } from './repository/public-holiday.repository';

@Injectable()
export class PublicHolidayService {
  constructor(
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository
  ) {}

  async create(
    createPublicHolidayDto: CreatePublicHolidayDto
  ): Promise<PublicHoliday> {
    try {
      const name: string = createPublicHolidayDto.name;
      const description: string = createPublicHolidayDto.description
        ? createPublicHolidayDto.description
        : '';
      const publicHoliday = this.publicHolidayRepo.create({
        ...createPublicHolidayDto,
        date: validateDateTime(createPublicHolidayDto.date),
        name,
        description
      });
      return await this.publicHolidayRepo.save(publicHoliday);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        publicHolidayConstraint,
        createPublicHolidayDto
      );
    }
  }

  async exportFile(
    pagination: PaginationQueryPublicHolidayDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.PUBLIC_HOLIDAY,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PaginationQueryPublicHolidayDto
  ): Promise<PaginationResponse<PublicHoliday>> {
    let dateCondition: Date | FindOperator<Date>;
    if (pagination.year) {
      checkIsValidYearFormat(pagination.year, DEFAULT_YEAR_FORMAT);
    } else {
      pagination.year = dayJs().get('year');
    }
    if (pagination.month) {
      checkIsValidYearFormat(pagination.month, DEFAULT_MONTH_FORMAT);
    }
    if (pagination.year && pagination.month) {
      dateCondition = Raw(
        (date) =>
          `EXTRACT(YEAR FROM ${date}) = '${pagination.year}' AND EXTRACT(MONTH FROM ${date}) = '${pagination.month}'`
      );
    } else if (pagination.year) {
      dateCondition = Raw(
        (date) => `EXTRACT(YEAR FROM ${date}) = '${pagination.year}'`
      );
    } else if (pagination.month) {
      dateCondition = Raw(
        (date) => `EXTRACT(MONTH FROM ${date}) = '${pagination.month}'`
      );
    }

    return await this.publicHolidayRepo.findAllWithPagination(
      pagination,
      PublicHolidaySearchableColumns,
      {
        where: {
          date: dateCondition
        }
      }
    );
  }

  async findOne(id: number): Promise<PublicHoliday> {
    return await this.publicHolidayRepo.getPublicHolidayByCondition({
      id
    });
  }

  async update(
    id: number,
    updatePublicHolidayDto: UpdatePublicHolidayDto
  ): Promise<PublicHoliday> {
    try {
      const publicHoliday = await this.findOne(id);
      const publicHolidayEntity = this.publicHolidayRepo.create(
        Object.assign(publicHoliday, {
          ...updatePublicHolidayDto,
          date: updatePublicHolidayDto.date
            ? validateDateTime(updatePublicHolidayDto.date)
            : publicHoliday.date
        })
      );

      return await this.publicHolidayRepo.save(publicHolidayEntity);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        publicHolidayConstraint,
        updatePublicHolidayDto
      );
    }
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.publicHolidayRepo.delete(id);
  }
}
