import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { systemDefined } from '../shared-resources/common/utils/exception-message';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { Repository } from 'typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { benefitComponentConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateBenefitComponentDto } from './dto/create-benefit-component.dto';
import { UpdateBenefitComponentDto } from './dto/update-benefit-component.dto';
import {
  BenefitComponent,
  benefitComponentSearchableColumns
} from './entities/benefit-component.entity';
import { BenefitComponentValidationService } from './benefit-component.validation';
import { PaginationBenefitComponentDto } from './dto/pagination-benefit-component.dto';
import { BENEFIT_COMPONENT_RELATIONSHIP } from './constant/benefit-component-relationship.constant';
import { BENEFIT_COMPONENT_SELECTED_FIELDS } from './constant/benefit-component-selected-fields.constant';

@Injectable()
export class BenefitComponentService {
  private readonly IS_SYSTEM_DEFINED = 'is system defined';

  constructor(
    @InjectRepository(BenefitComponent)
    private readonly benefitComponentRepo: Repository<BenefitComponent>,
    private readonly benefitComponentValidationService: BenefitComponentValidationService
  ) {}

  async create(
    createBenefitComponentDto: CreateBenefitComponentDto
  ): Promise<BenefitComponent> {
    try {
      await this.benefitComponentValidationService.checkBenefitComponentTypeById(
        createBenefitComponentDto.benefitComponentTypeId
      );

      const benefitComponent: BenefitComponent =
        this.benefitComponentRepo.create({
          name: createBenefitComponentDto.name,
          nameKhmer: createBenefitComponentDto.nameKhmer,
          benefitComponentType: {
            id: createBenefitComponentDto.benefitComponentTypeId
          },
          isFixed: createBenefitComponentDto.isFixed
        });

      return await this.benefitComponentRepo.save(benefitComponent);
    } catch (exception) {
      handleResourceConflictException(exception, benefitComponentConstraint);
      throw exception;
    }
  }

  async exportFile(
    pagination: PaginationBenefitComponentDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.BENEFIT_COMPONENT,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PaginationBenefitComponentDto
  ): Promise<PaginationResponse<BenefitComponent>> {
    return await GetPagination(
      this.benefitComponentRepo,
      pagination,
      benefitComponentSearchableColumns,
      {
        where: {
          benefitComponentType: { id: pagination.salaryComponentTypeId }
        },
        relation: BENEFIT_COMPONENT_RELATIONSHIP,
        select: BENEFIT_COMPONENT_SELECTED_FIELDS
      }
    );
  }

  async findOne(id: number): Promise<BenefitComponent> {
    return await this.benefitComponentValidationService.checkBenefitComponentById(
      id
    );
  }

  async update(
    id: number,
    updateBenefitComponentDto: UpdateBenefitComponentDto
  ): Promise<BenefitComponent> {
    try {
      const benefitComponent: BenefitComponent =
        await this.benefitComponentValidationService.checkBenefitComponentById(
          id
        );

      if (benefitComponent.isSystemDefined) {
        throw new ResourceForbiddenException(
          this.IS_SYSTEM_DEFINED,
          systemDefined
        );
      }

      updateBenefitComponentDto.benefitComponentTypeId &&
        (await this.benefitComponentValidationService.checkBenefitComponentTypeById(
          updateBenefitComponentDto.benefitComponentTypeId
        ));

      const newBenefitComponent: BenefitComponent = Object.assign(
        benefitComponent,
        updateBenefitComponentDto,
        {
          benefitComponentType: {
            id: updateBenefitComponentDto.benefitComponentTypeId
          }
        }
      );

      return await this.benefitComponentRepo.save(newBenefitComponent);
    } catch (exception) {
      handleResourceConflictException(exception, benefitComponentConstraint);
    }
  }

  async delete(id: number): Promise<void> {
    const data =
      await this.benefitComponentValidationService.checkBenefitComponentById(
        id
      );

    if (data.isSystemDefined) {
      throw new ResourceForbiddenException(
        this.IS_SYSTEM_DEFINED,
        systemDefined
      );
    }

    await this.benefitComponentRepo.delete(id);
  }
}
