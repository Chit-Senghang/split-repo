import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { ExportFileDto } from './../shared-resources/export-file/dto/export-file.dto';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { workShiftTypeConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { PaginationWorkShiftTypeDto } from './dto/pagination-workshift-type.dto';
import { UpdateWorkshiftTypeDto as UpdateWorkShiftTypeDto } from './dto/update-workshift-type.dto';
import { WorkshiftType as WorkShiftType } from './entities/workshift-type.entity';

@Injectable()
export class WorkShiftTypeService {
  private readonly WORK_SHIFT_TYPE = 'work shift type';

  constructor(
    @InjectRepository(WorkShiftType)
    private readonly workShiftTypeRepo: Repository<WorkShiftType>
  ) {}

  async findAll(pagination: PaginationWorkShiftTypeDto) {
    return GetPagination(this.workShiftTypeRepo, pagination, ['name'], {
      where: {
        isSystemDefined: pagination.isSystemDefined,
        workingShift: {
          id: pagination.workingShiftTypeId || null
        }
      },
      relation: {
        workingShift: true
      }
    });
  }

  async exportFile(
    pagination: PaginationWorkShiftTypeDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.WORK_SHIFT_TYPE,
      exportFileDto,
      data
    );
  }

  async findOne(id: number) {
    const workShiftType = await this.workShiftTypeRepo.findOneBy({ id });
    if (!workShiftType) {
      throw new ResourceNotFoundException(this.WORK_SHIFT_TYPE, id);
    }
    return workShiftType;
  }

  async update(id: number, updateWorkShiftTypeDto: UpdateWorkShiftTypeDto) {
    try {
      const workShiftType = await this.findOne(id);
      return await this.workShiftTypeRepo.save(
        Object.assign(workShiftType, updateWorkShiftTypeDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        workShiftTypeConstraint,
        updateWorkShiftTypeDto
      );
    }
  }
}
