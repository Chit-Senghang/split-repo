import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { systemDefined } from '../shared-resources/common/utils/exception-message';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ResourceNotFoundException } from '../shared-resources/exception';
import {
  customTrimNumber,
  customTrimString
} from '../shared-resources/utils/custom-trim-number.utils';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { benefitComponentTypeConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { CreateSalaryComponentTypeDto } from './dto/create-benefit-component-type.dto';
import { PaginationQuerySalaryComponentTypeDto } from './dto/pagination-query-benefit-component-type';
import { UpdateSalaryComponentTypeDto } from './dto/update-benefit-component-type.dto';
import {
  BenefitComponentType,
  salaryComponentTypeSearchableColumns
} from './entities/benefit-component-type.entity';

@Injectable()
export class SalaryComponentTypeService {
  private readonly SALARY_COMPONENT_TYPE: 'salary component type';

  constructor(
    @InjectRepository(BenefitComponentType)
    private readonly salaryComponentTypeRepo: Repository<BenefitComponentType>
  ) {}

  async create(
    createSalaryComponentTypeDto: CreateSalaryComponentTypeDto
  ): Promise<BenefitComponentType> {
    try {
      return await this.salaryComponentTypeRepo.save({
        ...createSalaryComponentTypeDto
      });
    } catch (exception) {
      handleResourceConflictException(
        exception,
        benefitComponentTypeConstraint,
        createSalaryComponentTypeDto
      );
    }
  }

  async exportFile(
    pagination: PaginationQuerySalaryComponentTypeDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.BENEFIT_COMPONENT_TYPE,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationQuerySalaryComponentTypeDto) {
    let results: any;
    if (pagination.taxPercentage) {
      const query = await this.salaryComponentTypeRepo.query(`
        SELECT * FROM benefit_component_type WHERE CAST(tax_percentage AS INT) = ${pagination.taxPercentage};
    `);
      results = query.map((result: any) => result.tax_percentage);
    }
    return await GetPagination(
      this.salaryComponentTypeRepo,
      pagination,
      salaryComponentTypeSearchableColumns,
      {
        where: {
          taxPercentage: typeof results !== 'undefined' ? In(results) : null
        }
      }
    );
  }

  async findOne(id: number): Promise<BenefitComponentType> {
    const salaryComponentType = await this.salaryComponentTypeRepo.findOneBy({
      id
    });
    if (!salaryComponentType) {
      throw new ResourceNotFoundException(this.SALARY_COMPONENT_TYPE, id);
    }
    return salaryComponentType;
  }

  async update(
    id: number,
    updateSalaryComponentTypeDto: UpdateSalaryComponentTypeDto
  ) {
    try {
      const salaryComponentTypeFind = await this.findOne(id);
      const name = customTrimString(updateSalaryComponentTypeDto.name);
      const taxPercentage = customTrimNumber(
        updateSalaryComponentTypeDto.taxPercentage
      );
      const salaryComponentType = Object.assign(salaryComponentTypeFind, {
        ...(salaryComponentTypeFind.isSystemDefined ? {} : { name }),
        taxPercentage
      });

      return await this.salaryComponentTypeRepo.save(salaryComponentType);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        benefitComponentTypeConstraint,
        updateSalaryComponentTypeDto
      );
    }
  }

  async delete(id: number): Promise<void> {
    const data = await this.findOne(id);

    if (data.isSystemDefined) {
      throw new ResourceForbiddenException('isSystemDefined', systemDefined);
    }

    await this.salaryComponentTypeRepo.delete(id);
  }
}
