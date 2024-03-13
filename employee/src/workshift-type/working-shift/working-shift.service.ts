import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  getCurrentDate,
  dayJs
} from '../../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { GetPagination } from '../../shared-resources/utils/pagination-query.common';
import { customValidateTime } from '../../shared-resources/utils/validate-date-format';
import { ScanTypeEnum } from '../common/ts/enum/status-type.enum';
import {
  searchableColumnsWorkingShift,
  WorkingShift
} from '../entities/working-shift.entity';
import { WorkshiftType } from '../entities/workshift-type.entity';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from './../../shared-resources/export-file/common/enum/data-table-name.enum';
import { ExportFileDto } from './../../shared-resources/export-file/dto/export-file.dto';
import { handleResourceConflictException } from './../../shared-resources/common/utils/handle-resource-conflict-exception';
import { workingShiftConstraint } from './../../shared-resources/ts/constants/resource-exception-constraints';
import { CreateWorkingShiftDto } from './dto/create-working-shift.dto';
import { PaginationWorkShiftDto } from './dto/pagination-workingshift.dto';
import { UpdateWorkingShiftDto } from './dto/update-working-shift.dto';

@Injectable()
export class WorkingShiftService {
  private readonly WORKING_SHIFT = 'working shift';

  private readonly WORK_SHIFT_TYPE = 'workshift type';

  constructor(
    @InjectRepository(WorkingShift)
    private readonly workingShiftRepo: Repository<WorkingShift>,
    @InjectRepository(WorkshiftType)
    private readonly workshiftTypeRepo: Repository<WorkshiftType>
  ) {}

  async checkWorkShiftType(id: number) {
    const workshiftType = await this.workshiftTypeRepo.findOne({
      where: { id }
    });

    if (!workshiftType) {
      throw new ResourceNotFoundException(this.WORK_SHIFT_TYPE, id);
    }
  }

  async create(
    createWorkingShiftDto: CreateWorkingShiftDto
  ): Promise<WorkingShift> {
    try {
      await this.checkWorkShiftType(createWorkingShiftDto.workshiftTypeId);
      const currentDate = getCurrentDate().format(DEFAULT_DATE_FORMAT);
      const { scanType } = createWorkingShiftDto;

      if (String(scanType) === ScanTypeEnum[ScanTypeEnum.TWO_TIMES]) {
        createWorkingShiftDto.scanType = ScanTypeEnum.TWO_TIMES;
      } else {
        createWorkingShiftDto.scanType = ScanTypeEnum.FOUR_TIMES;
      }

      const workingShift: WorkingShift = this.workingShiftRepo.create({
        name: createWorkingShiftDto.name,
        workshiftType: { id: createWorkingShiftDto.workshiftTypeId },
        scanType: createWorkingShiftDto.scanType,
        startWorkingTime: createWorkingShiftDto.startWorkingTime,
        endWorkingTime: createWorkingShiftDto.endWorkingTime,
        startScanTimePartOne: createWorkingShiftDto.startScanTimePartOne,
        endScanTimePartOne: createWorkingShiftDto.endScanTimePartOne,
        startScanTimePartTwo: createWorkingShiftDto.startScanTimePartTwo,
        endScanTimePartTwo: createWorkingShiftDto.endScanTimePartTwo,
        breakTime: createWorkingShiftDto.breakTime ?? 0,
        workOnWeekend: createWorkingShiftDto.workOnWeekend,
        weekendScanTime: createWorkingShiftDto.weekendScanTime,
        workingHour:
          this.subTrackTime(
            `${currentDate} ${createWorkingShiftDto.endScanTimePartOne}`,
            `${currentDate} ${createWorkingShiftDto.startScanTimePartOne}`
          ) - createWorkingShiftDto.breakTime || 60
      });

      return await this.workingShiftRepo.save(workingShift);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        workingShiftConstraint,
        createWorkingShiftDto
      );
    }
  }

  async exportFile(
    pagination: PaginationWorkShiftDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.WORKING_SHIFT,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationWorkShiftDto) {
    let startWorkingTime: any, endWorkingTime: any, breakTime: any;
    if (pagination.startWorkingTime) {
      startWorkingTime = customValidateTime(pagination.startWorkingTime);
    }
    if (pagination.endWorkingTime) {
      endWorkingTime = customValidateTime(pagination.endWorkingTime);
    }
    if (pagination.breakTime) {
      breakTime = customValidateTime(pagination.breakTime);
    }

    return GetPagination(
      this.workingShiftRepo,
      pagination,
      searchableColumnsWorkingShift,
      {
        where: {
          id: pagination.workingShiftId,
          scanType: pagination.scanType ? pagination.scanType : null,
          startWorkingTime,
          endWorkingTime,
          breakTime,
          workingHour: pagination.workingHour,
          workOnWeekend: pagination.workOnWeekend,
          workshiftType: {
            id: pagination.workingShiftTypeId
              ? pagination.workingShiftTypeId
              : null
          }
        },
        relation: { workshiftType: true },
        select: { workshiftType: { id: true, name: true } },
        mapFunction: (workingShift: WorkingShift) => {
          let newWorkingShift;
          if (workingShift.scanType === ScanTypeEnum.TWO_TIMES) {
            delete workingShift.scanType;
            newWorkingShift = workingShift;
            newWorkingShift['scanType'] = Object.values(ScanTypeEnum)[0];
          } else {
            delete workingShift.scanType;
            newWorkingShift = workingShift;
            newWorkingShift['scanType'] = Object.values(ScanTypeEnum)[1];
          }
          return { ...newWorkingShift };
        }
      }
    );
  }

  async findOne(id: number): Promise<WorkingShift> {
    const workingShift = await this.workingShiftRepo.findOne({
      where: {
        id
      },
      relations: {
        workshiftType: true
      },
      select: { workshiftType: { id: true, name: true } }
    });
    if (!workingShift) {
      throw new ResourceNotFoundException(this.WORKING_SHIFT, id);
    }
    let newWorkingShift;
    if (workingShift.scanType === ScanTypeEnum.FOUR_TIMES) {
      delete workingShift.scanType;
      newWorkingShift = workingShift;
      newWorkingShift['scanType'] = ScanTypeEnum[ScanTypeEnum.FOUR_TIMES];
    } else {
      delete workingShift.scanType;
      newWorkingShift = workingShift;
      newWorkingShift['scanType'] = ScanTypeEnum[ScanTypeEnum.TWO_TIMES];
    }
    return workingShift;
  }

  async update(id: number, updateWorkingShiftDto: UpdateWorkingShiftDto) {
    try {
      const workingShift = await this.findOne(id);
      const date = getCurrentDate().format(DEFAULT_DATE_FORMAT);
      if (
        updateWorkingShiftDto.scanType.toString() ===
        Object.values(ScanTypeEnum)[0]
      ) {
        updateWorkingShiftDto.scanType = 2;
      } else {
        updateWorkingShiftDto.scanType = 4;
      }
      const data = Object.assign(workingShift, {
        workshiftType: {
          id: updateWorkingShiftDto.workshiftTypeId
        },
        ...updateWorkingShiftDto
      });

      data.workingHour =
        this.subTrackTime(
          `${date} ${updateWorkingShiftDto.endScanTimePartOne}`,
          `${date} ${updateWorkingShiftDto.startScanTimePartOne}`
        ) - updateWorkingShiftDto.breakTime || 60;
      return await this.workingShiftRepo.save(data);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        workingShiftConstraint,
        updateWorkingShiftDto
      );
    }
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.workingShiftRepo.delete(id);
  }

  private subTrackTime(date1: string, date2: string) {
    return dayJs(date1).utc(true).diff(dayJs(date2).utc(true), 'minute');
  }
}
