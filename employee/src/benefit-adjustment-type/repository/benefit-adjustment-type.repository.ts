/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner
} from 'typeorm';
import { BasePaginationQueryDto } from '../../shared-resources/common/dto/base-pagination-query.dto';
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { BenefitAdjustmentType } from '../entities/benefit-adjustment-type.entity';
import { IBenefitAdjustmentType } from './interfaces/benefit-adjustment.repository.interface';

@Injectable()
export class BenefitAdjustmentTypeRepository
  extends RepositoryBase<BenefitAdjustmentType>
  implements IBenefitAdjustmentType
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(BenefitAdjustmentType));
  }

  save(entity: BenefitAdjustmentType): Promise<BenefitAdjustmentType> {
    throw new Error('Method not implemented.');
  }

  findOne(
    options: FindOneOptions<BenefitAdjustmentType>
  ): Promise<BenefitAdjustmentType> {
    throw new Error('Method not implemented.');
  }

  find(
    options?: FindManyOptions<BenefitAdjustmentType>
  ): Promise<BenefitAdjustmentType[]> {
    throw new Error('Method not implemented.');
  }

  delete(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  softDelete(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  findAllWithPagination(
    pagination: BasePaginationQueryDto,
    searchableColumns: string[],
    options?: {
      where?: FindOptionsWhere<BenefitAdjustmentType>;
      select?: FindOptionsSelect<BenefitAdjustmentType>;
      relation?: FindOptionsRelations<BenefitAdjustmentType>;
      orderBy?: FindOptionsOrder<BenefitAdjustmentType>;
      mapFunction?: (data: BenefitAdjustmentType, index?: number) => any;
    }
  ): Promise<PaginationResponse<BenefitAdjustmentType>> {
    throw new Error('Method not implemented.');
  }

  create(
    entityLike: DeepPartial<BenefitAdjustmentType>
  ): BenefitAdjustmentType {
    throw new Error('Method not implemented.');
  }

  query(query: string, parameters?: any[]): Promise<any> {
    throw new Error('Method not implemented.');
  }

  runTransaction(
    callBack: (queryRunner: QueryRunner) => any,
    failBack?: () => any
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  findOneBy(
    where:
      | FindOptionsWhere<BenefitAdjustmentType>
      | FindOptionsWhere<BenefitAdjustmentType>[]
  ): Promise<BenefitAdjustmentType> {
    throw new Error('Method not implemented.');
  }

  findAndCount(
    options?: FindManyOptions<BenefitAdjustmentType>
  ): Promise<[BenefitAdjustmentType[], number]> {
    throw new Error('Method not implemented.');
  }

  exist(options?: FindManyOptions<BenefitAdjustmentType>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getOneOrFailed(id: number): Promise<BenefitAdjustmentType> {
    const benefitAdjustmentType: BenefitAdjustmentType | null =
      await this.findOne({ where: { id } });

    if (!benefitAdjustmentType) {
      throw new ResourceNotFoundException('benefit adjustment type', id);
    }
    return benefitAdjustmentType;
  }
}
