import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { InjectRepository } from '@nestjs/typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { IUpdateFingerprintDevice } from '../shared-resources/proto/employee/employee.pb';
import { fingerprintDeviceConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { CreateFingerPrintDeviceDto } from './dto/create-finger-print-device.dto';
import { UpdateFingerPrintDeviceDto } from './dto/update-finger-print-device.dto';
import {
  FingerprintDevice,
  fingerPrintDeviceSearchableColumns
} from './entities/finger-print-device.entity';
import { FingerPrintPaginationDto } from './dto/finger-print-paginate.dto';

@Injectable()
export class FingerPrintDeviceService {
  private FINGERPRINT = 'fingerprint';

  constructor(
    @InjectRepository(FingerprintDevice)
    private readonly fingerPrintDeviceRepo: Repository<FingerprintDevice>
  ) {}

  async create(createFingerPrintDeviceDto: CreateFingerPrintDeviceDto) {
    try {
      const data = this.fingerPrintDeviceRepo.create({
        description: createFingerPrintDeviceDto.description,
        ipAddress: createFingerPrintDeviceDto.ipAddress,
        modelName: createFingerPrintDeviceDto.modelName,
        specification: createFingerPrintDeviceDto.specification,
        port: createFingerPrintDeviceDto.port
      });

      return await this.fingerPrintDeviceRepo.save(data);
    } catch (exception) {
      handleResourceConflictException(exception, fingerprintDeviceConstraint);
    }
  }

  async exportFile(
    pagination: FingerPrintPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.FINGER_PRINT_DEVICE,
      exportFileDto,
      data
    );
  }

  findAll(pagination: FingerPrintPaginationDto) {
    return GetPagination(
      this.fingerPrintDeviceRepo,
      pagination,
      fingerPrintDeviceSearchableColumns,
      {}
    );
  }

  async findOne(id: number) {
    const data = await this.fingerPrintDeviceRepo.findOne({ where: { id } });
    if (!data) {
      throw new ResourceNotFoundException(this.FINGERPRINT);
    }

    return data;
  }

  async update(
    id: number,
    updateFingerPrintDeviceDto: UpdateFingerPrintDeviceDto
  ) {
    try {
      const data = await this.findOne(id);
      const fingerPrint = Object.assign(data, updateFingerPrintDeviceDto);

      return await this.fingerPrintDeviceRepo.save(fingerPrint);
    } catch (exception) {
      handleResourceConflictException(exception, fingerprintDeviceConstraint);
    }
  }

  remove(id: number) {
    return this.fingerPrintDeviceRepo.delete(id);
  }

  async grpcUpdateFingerprintDeviceStatus(
    updateFingerprintDeviceDto: IUpdateFingerprintDevice
  ) {
    try {
      const fingerprintDevice = await this.fingerPrintDeviceRepo.findOneBy({
        id: updateFingerprintDeviceDto.id
      });

      if (fingerprintDevice) {
        await this.fingerPrintDeviceRepo.save(
          Object.assign(fingerprintDevice, {
            lastRetrievedDate: updateFingerprintDeviceDto.lastRetrievedDate,
            lastRetrievedStatus: updateFingerprintDeviceDto.lastRetrievedStatus
          })
        );
      }
    } catch (error) {
      Logger.log(error);
    }
  }
}
