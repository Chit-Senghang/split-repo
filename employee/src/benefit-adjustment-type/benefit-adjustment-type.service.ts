import { Inject, Injectable } from '@nestjs/common';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { benefitAdjustmentTypeConstraint } from '../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from '../shared-resources/common/utils/handle-resource-conflict-exception';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { CreateBenefitAdjustmentTypeDto } from './dto/create-benefit-adjustment-type.dto';
import { UpdateBenefitAdjustmentTypeDto } from './dto/update-benefit-adjustment-type.dto';
import { BenefitAdjustmentTypeRepository } from './repository/benefit-adjustment-type.repository';
import { IBenefitAdjustmentType } from './repository/interfaces/benefit-adjustment.repository.interface';
import { BenefitAdjustmentType } from './entities/benefit-adjustment-type.entity';
import { BenefitAdjustmentTypeQueryDto } from './dto/benefit-adjustment-type-query.dto';

@Injectable()
export class BenefitAdjustmentTypeService {
  constructor(
    @Inject(BenefitAdjustmentTypeRepository)
    private readonly benefitAdjustmentTypeRepo: IBenefitAdjustmentType
  ) {}

  async exportFile(
    pagination: BenefitAdjustmentTypeQueryDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.BENEFIT_ADJUSTMENT_TYPE,
      exportFileDto,
      data
    );
  }

  async create(
    createBenefitAdjustmentTypeDto: CreateBenefitAdjustmentTypeDto
  ): Promise<BenefitAdjustmentType> {
    try {
      const benefitAdjustmentType: BenefitAdjustmentType =
        this.benefitAdjustmentTypeRepo.create(createBenefitAdjustmentTypeDto);

      return await this.benefitAdjustmentTypeRepo.save(benefitAdjustmentType);
    } catch (error) {
      handleResourceConflictException(error, benefitAdjustmentTypeConstraint);
      return error;
    }
  }

  async findAll(
    query: BenefitAdjustmentTypeQueryDto
  ): Promise<PaginationResponse<BenefitAdjustmentType>> {
    return await this.benefitAdjustmentTypeRepo.findAllWithPagination(
      query,
      ['name'],
      {}
    );
  }

  async findOne(id: number): Promise<BenefitAdjustmentType> {
    return await this.benefitAdjustmentTypeRepo.getOneOrFailed(id);
  }

  async update(
    id: number,
    updateBenefitAdjustmentTypeDto: UpdateBenefitAdjustmentTypeDto
  ) {
    try {
      //validate is system defined record
      const benefitAdjustmentType: BenefitAdjustmentType =
        await this.checkIsSystemDefined(id);

      const BenefitAdjustmentTypeEntity: BenefitAdjustmentType =
        this.benefitAdjustmentTypeRepo.create({
          ...benefitAdjustmentType,
          ...updateBenefitAdjustmentTypeDto
        });

      return await this.benefitAdjustmentTypeRepo.save(
        BenefitAdjustmentTypeEntity
      );
    } catch (error) {
      handleResourceConflictException(error, benefitAdjustmentTypeConstraint);
      return error;
    }
  }

  async delete(id: number): Promise<void> {
    await this.checkIsSystemDefined(id);
    await this.benefitAdjustmentTypeRepo.delete(id);
  }

  // ============== [Private block] ==============
  async checkIsSystemDefined(id: number): Promise<BenefitAdjustmentType> {
    const benefitAdjustmentType: BenefitAdjustmentType = await this.findOne(id);
    if (benefitAdjustmentType.isSystemDefined) {
      throw new ResourceForbiddenException(
        'benefit adjustment detail',
        'No modification is allowed due to system defined.'
      );
    }

    return benefitAdjustmentType;
  }
}
