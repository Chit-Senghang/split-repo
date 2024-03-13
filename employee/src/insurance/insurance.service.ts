import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { insuranceConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import {
  Insurance,
  insuranceSearchableColumns
} from './entities/insurance.entity';
import { InsurancePaginationQueryDto } from './dto/pagination-insurance.dto';

@Injectable()
export class InsuranceService {
  private readonly INSURANCE = 'insurance';

  constructor(
    @InjectRepository(Insurance)
    private readonly insuranceRepo: Repository<Insurance>
  ) {}

  async create(createInsuranceDto: CreateInsuranceDto): Promise<Insurance> {
    try {
      const checkName = createInsuranceDto.name.trim();
      return this.insuranceRepo.save(
        this.insuranceRepo.create({
          name: checkName
        })
      );
    } catch (exception) {
      handleResourceConflictException(exception, insuranceConstraint);
    }
  }

  async findAll(pagination: InsurancePaginationQueryDto) {
    return GetPagination(
      this.insuranceRepo,
      pagination,
      insuranceSearchableColumns
    );
  }

  async exportFile(
    pagination: InsurancePaginationQueryDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.INSURANCE,
      exportFileDto,
      data
    );
  }

  async findOne(id: number): Promise<Insurance> {
    const insurance = await this.insuranceRepo.findOne({
      where: { id }
    });
    if (!insurance) {
      throw new ResourceNotFoundException(this.INSURANCE, id);
    }
    return insurance;
  }

  async update(
    id: number,
    updateInsuranceDto: UpdateInsuranceDto
  ): Promise<
    Insurance & {
      name: string;
    }
  > {
    try {
      const trimInsurance = updateInsuranceDto.name.trim();
      const insurance = await this.findOne(id);
      return this.insuranceRepo.save(
        Object.assign(insurance, {
          name: trimInsurance
        })
      );
    } catch (exception) {
      handleResourceConflictException(exception, insuranceConstraint);
    }
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.insuranceRepo.delete(id);
  }
}
