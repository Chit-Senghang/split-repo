import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { BenefitComponentValidationService } from '../benefit-component/benefit-component.validation';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { benefitIncrementPolicyConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import {
  CreateBenefitIncreasementPolicyDetailDto,
  CreateBenefitIncreasementPolicyDto
} from './dto/create-benefit-increasement-policy.dto';
import { UpdateBenefitIncreasementPolicyDto } from './dto/update-benefit-increasement-policy.dto';
import { BenefitIncreasementPolicy } from './entities/benefit-increasement-policy.entity';
import { BenefitIncreasementPolicyDetail } from './entities/benefit-increasement-policy-detail.entity';
import { PaginationBenefitInscreasementPolicyDto } from './dto/pagination-benefit-increasement-policy.dto';
import {
  BENEFIT_INCREASEMENT_POLICY_RELATIONSHIP,
  BENEFIT_INCREASEMENT_POLICY_SELECTED_FIELDS
} from './constant/benefit-increasement-policy.contant';

@Injectable()
export class BenefitIncreasementPolicyService {
  constructor(
    @InjectRepository(BenefitIncreasementPolicy)
    private readonly benefitIncreasementPolicyRepo: Repository<BenefitIncreasementPolicy>,
    private readonly dataSource: DataSource,
    private readonly benefitComponentService: BenefitComponentValidationService
  ) {}

  async create(
    createBenefitIncreasementPolicyDto: CreateBenefitIncreasementPolicyDto
  ): Promise<BenefitIncreasementPolicy> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const benefitIncreasementPolicyDto: BenefitIncreasementPolicy =
        queryRunner.manager.create(BenefitIncreasementPolicy, {
          name: createBenefitIncreasementPolicyDto.name
        });

      const benefitIncreasementPolicy: BenefitIncreasementPolicy =
        await queryRunner.manager.save(benefitIncreasementPolicyDto);

      if (benefitIncreasementPolicy) {
        //create benefit increasement details
        await this.createOrUpdateBenefitIncreasementPolicyDetail(
          benefitIncreasementPolicy,
          createBenefitIncreasementPolicyDto.detail,
          queryRunner
        );
      }
      await queryRunner.commitTransaction();
      return benefitIncreasementPolicy;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        benefitIncrementPolicyConstraint,
        createBenefitIncreasementPolicyDto
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createOrUpdateBenefitIncreasementPolicyDetail(
    benefitIncreasementPolicy: BenefitIncreasementPolicy,
    benefitIncreasementPolicyDetails: CreateBenefitIncreasementPolicyDetailDto[],
    queryRunner: QueryRunner,
    isUpdate = false
  ) {
    if (isUpdate) {
      //delete existing benefit increasement detail
      const ids: number[] =
        benefitIncreasementPolicy.benefitIncreasementPolicyDetail.map(
          (item: BenefitIncreasementPolicyDetail) => item.id
        );

      await this.deleteExistingBenefitIncreasementDetails(ids, queryRunner);
    }

    for (const data of benefitIncreasementPolicyDetails) {
      //validate benefit componentId exist or not
      await this.benefitComponentService.checkBenefitComponentById(
        data.benefitComponentId
      );

      const benefitIncreasementPolicyDetailDto: BenefitIncreasementPolicyDetail =
        queryRunner.manager.create(BenefitIncreasementPolicyDetail, {
          ...data,
          benefitComponent: { id: data.benefitComponentId },
          benefitIncreasementPolicy: { id: benefitIncreasementPolicy.id }
        });

      await queryRunner.manager.save(benefitIncreasementPolicyDetailDto);
    }
  }

  async exportFile(
    pagination: PaginationBenefitInscreasementPolicyDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.BENEFIT_INCREMENT_POLICY,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PaginationBenefitInscreasementPolicyDto
  ): Promise<PaginationResponse<BenefitIncreasementPolicy>> {
    return GetPagination(
      this.benefitIncreasementPolicyRepo,
      pagination,
      ['name'],
      {
        relation: BENEFIT_INCREASEMENT_POLICY_RELATIONSHIP,
        select: BENEFIT_INCREASEMENT_POLICY_SELECTED_FIELDS,
        mapFunction: (benefitIncreasementPolicy: BenefitIncreasementPolicy) => {
          return {
            id: benefitIncreasementPolicy.id,
            name: benefitIncreasementPolicy.name,
            detail: benefitIncreasementPolicy.benefitIncreasementPolicyDetail
          };
        }
      }
    );
  }

  async findOne(id: number): Promise<{
    name: string;
    detail: BenefitIncreasementPolicyDetail[];
  }> {
    const benefitIncreasementPolicy: BenefitIncreasementPolicy =
      await this.checkBenefitIncreasementPolicyById(id);

    return {
      name: benefitIncreasementPolicy.name,
      detail: benefitIncreasementPolicy.benefitIncreasementPolicyDetail
    };
  }

  async update(
    id: number,
    updateBenefitIncreasementPolicyDto: UpdateBenefitIncreasementPolicyDto
  ): Promise<BenefitIncreasementPolicy> {
    const benefitIncreasementPolicy: BenefitIncreasementPolicy =
      await this.checkBenefitIncreasementPolicyById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.manager.save(
        Object.assign(benefitIncreasementPolicy, {
          name: updateBenefitIncreasementPolicyDto.name
        })
      );

      if (benefitIncreasementPolicy) {
        //create benefit increasement details
        await this.createOrUpdateBenefitIncreasementPolicyDetail(
          benefitIncreasementPolicy,
          updateBenefitIncreasementPolicyDto.detail,
          queryRunner,
          true
        );
      }
      await queryRunner.commitTransaction();
      return benefitIncreasementPolicy;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        benefitIncrementPolicyConstraint,
        updateBenefitIncreasementPolicyDto
      );
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number): Promise<void> {
    const benefitIncreasementPolicy: BenefitIncreasementPolicy =
      await this.checkBenefitIncreasementPolicyById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const ids: number[] =
        benefitIncreasementPolicy.benefitIncreasementPolicyDetail.map(
          (item: BenefitIncreasementPolicyDetail) => item.id
        );
      await this.deleteExistingBenefitIncreasementDetails(ids, queryRunner);
      await queryRunner.manager.delete(BenefitIncreasementPolicy, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkBenefitIncreasementPolicyById(
    id: number
  ): Promise<BenefitIncreasementPolicy> {
    const benefitIncreasementPolicy: BenefitIncreasementPolicy =
      await this.benefitIncreasementPolicyRepo.findOne({
        where: { id },
        relations: BENEFIT_INCREASEMENT_POLICY_RELATIONSHIP,
        select: BENEFIT_INCREASEMENT_POLICY_SELECTED_FIELDS
      });

    if (!benefitIncreasementPolicy) {
      throw new ResourceNotFoundException('benefit increasement policy', id);
    }

    return benefitIncreasementPolicy;
  }

  async deleteExistingBenefitIncreasementDetails(
    benefitIncreasementPolicyDetailIds: number[],
    queryRunner: QueryRunner
  ): Promise<void> {
    await queryRunner.manager.delete(
      BenefitIncreasementPolicyDetail,
      benefitIncreasementPolicyDetailIds
    );
  }
}
