import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { ExportFileDto } from './../shared-resources/export-file/dto/export-file.dto';
import { PaginationGeographicDto } from './dto/pagintation-geographic.dto';
import {
  Geographic,
  geographicSearchableColumns
} from './entities/geographic.entity';

@Injectable()
export class GeographicService {
  private readonly GEOGRAPHIC = 'geographic';

  constructor(
    @InjectRepository(Geographic)
    private readonly geographicRepo: Repository<Geographic>
  ) {}

  async findAll(pagination: PaginationGeographicDto) {
    return GetPagination(
      this.geographicRepo,
      pagination,
      geographicSearchableColumns,
      {
        where: {
          geographicType: pagination.geographicType
        }
      }
    );
  }

  async exportFile(
    pagination: PaginationGeographicDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.GEOGRAPHIC,
      exportFileDto,
      data
    );
  }

  async findOne(id: number) {
    const geographic = await this.geographicRepo.findOneBy({ id });
    if (!geographic) {
      throw new ResourceNotFoundException(this.GEOGRAPHIC, id);
    }
    return geographic;
  }

  async listGeographic(id: number) {
    const geographic = await this.geographicRepo.find({
      where: id
        ? {
            parentId: { id }
          }
        : null,
      relations: {
        parentId: true
      }
    });
    if (!geographic) {
      throw new ResourceNotFoundException(this.GEOGRAPHIC, id);
    }
    return geographic;
  }
}
