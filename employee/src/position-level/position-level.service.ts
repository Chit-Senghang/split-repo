import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { EmployeeProto } from '../shared-resources/proto';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { positionLevelConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreatePositionLevelDto } from './dto/create-position-level.dto';
import { PositionLevelPaginationDto } from './dto/pagination-position-level.dto';
import { UpdatePositionLevelDto } from './dto/update-position-level.dto';
import {
  PositionLevel,
  positionLevelSearchableColumns
} from './entities/position-level.entity';

@Injectable()
export class PositionLevelService {
  private readonly POSITION_LEVEL = 'position level';

  constructor(
    @InjectRepository(PositionLevel)
    private readonly positionLevelRepo: Repository<PositionLevel>
  ) {}

  async create(
    createPositionLevelDto: CreatePositionLevelDto
  ): Promise<PositionLevel> {
    try {
      return await this.positionLevelRepo.save(
        this.positionLevelRepo.create({ ...createPositionLevelDto })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        positionLevelConstraint,
        createPositionLevelDto
      );
    }
  }

  async exportFile(
    pagination: PositionLevelPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.POSITION_LEVEL,
      exportFileDto,
      data
    );
  }

  findAll(
    pagination: PositionLevelPaginationDto
  ): Promise<PaginationResponse<PositionLevel>> {
    return GetPagination(
      this.positionLevelRepo,
      pagination,
      positionLevelSearchableColumns,
      {
        where: {
          levelNumber: pagination.levelNumber
        }
      }
    );
  }

  async findOne(id: number): Promise<PositionLevel> {
    const positionLevel = await this.positionLevelRepo.findOneBy({ id });
    if (!positionLevel) {
      throw new ResourceNotFoundException(this.POSITION_LEVEL, id);
    }

    return positionLevel;
  }

  async update(
    id: number,
    updatePositionLevelDto: UpdatePositionLevelDto
  ): Promise<PositionLevel & UpdatePositionLevelDto> {
    try {
      const positionLevel = await this.findOne(id);
      return await this.positionLevelRepo.save(
        Object.assign(positionLevel, updatePositionLevelDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        positionLevelConstraint,
        updatePositionLevelDto
      );
    }
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.positionLevelRepo.delete(id);
  }

  async grpcGetPositionLevelById(
    positionLevelId: EmployeeProto.PositionLevelId
  ) {
    const positionLevel = await this.positionLevelRepo.findOne({
      where: { id: positionLevelId.id }
    });
    if (!positionLevel) {
      throw new RpcException({
        message: `Resource ${this.POSITION_LEVEL} of ${positionLevelId.id} not found`,
        code: 5
      });
    }
    return { data: positionLevel };
  }

  async grpcFindOne(id: number): Promise<PositionLevel> {
    const positionLevel = await this.positionLevelRepo.findOne({
      where: { id }
    });
    if (!positionLevel) {
      throw new ResourceNotFoundException(this.POSITION_LEVEL, id);
    }
    return positionLevel;
  }
}
