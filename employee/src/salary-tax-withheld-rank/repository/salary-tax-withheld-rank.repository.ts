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
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
// import {
//   //   ResourceNo,
//   //   DeepPartial,
//   //   FindManyOptions,
//   FindOneOptions
//   //   FindOptionsOrder,
//   //   FindOptionsRelations,
//   //   FindOptionsSelect,
//   //   FindOptionsWhere,
//   //   QueryRunnertFoundException
// } from '../../shared-resources/exception';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { BasePaginationQueryDto } from '../../shared-resources/common/dto/base-pagination-query.dto';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { SalaryTaxWithheldRank } from '../entities/salary-tax-withheld-rank.entity';
import { ISalaryTaxWithheldRank } from './interfaces/salary-tax-withheld-rank.interface.interface';

@Injectable()
export class SalaryTaxWithheldRankRepository
  extends RepositoryBase<SalaryTaxWithheldRank>
  implements ISalaryTaxWithheldRank
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(SalaryTaxWithheldRank));
  }

  save(entity: SalaryTaxWithheldRank): Promise<SalaryTaxWithheldRank> {
    throw new Error('Method not implemented.');
  }

  findOne(
    options: FindOneOptions<SalaryTaxWithheldRank>
  ): Promise<SalaryTaxWithheldRank> {
    throw new Error('Method not implemented.');
  }

  find(
    options?: FindManyOptions<SalaryTaxWithheldRank>
  ): Promise<SalaryTaxWithheldRank[]> {
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
      where?: FindOptionsWhere<SalaryTaxWithheldRank>;
      select?: FindOptionsSelect<SalaryTaxWithheldRank>;
      relation?: FindOptionsRelations<SalaryTaxWithheldRank>;
      orderBy?: FindOptionsOrder<SalaryTaxWithheldRank>;
      mapFunction?: (data: SalaryTaxWithheldRank, index?: number) => any;
    }
  ): Promise<PaginationResponse<SalaryTaxWithheldRank>> {
    throw new Error('Method not implemented.');
  }

  create(
    entityLike: DeepPartial<SalaryTaxWithheldRank>
  ): SalaryTaxWithheldRank {
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
      | FindOptionsWhere<SalaryTaxWithheldRank>
      | FindOptionsWhere<SalaryTaxWithheldRank>[]
  ): Promise<SalaryTaxWithheldRank> {
    throw new Error('Method not implemented.');
  }

  findAndCount(
    options?: FindManyOptions<SalaryTaxWithheldRank>
  ): Promise<[SalaryTaxWithheldRank[], number]> {
    throw new Error('Method not implemented.');
  }

  exist(options?: FindManyOptions<SalaryTaxWithheldRank>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getOneOrFailed(id: number): Promise<SalaryTaxWithheldRank> {
    const salaryTaxWithheldRank: SalaryTaxWithheldRank | null =
      await this.findOne({
        where: { id }
      });

    if (!salaryTaxWithheldRank) {
      throw new ResourceNotFoundException('Salary Tax Withheld Rank', id);
    }
    return salaryTaxWithheldRank;
  }
}
