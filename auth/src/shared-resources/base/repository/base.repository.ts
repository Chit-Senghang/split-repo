import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner,
  Repository
} from 'typeorm';
import { Logger } from '@nestjs/common';
import config from '../../../typeormconfig';
import { PaginationResponse } from '../../ts/interface/response.interface';
import { GetPagination } from '../../utils/pagination-query.common';
import { BasePaginationQueryDto } from '../../common/dto/base-pagination-query.dto';
import { IRepositoryBase } from './interface/base.repository.interface';

export class RepositoryBase<T> implements IRepositoryBase<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async query(query: string, parameters?: any[]): Promise<any> {
    return await this.repository.query(query, parameters);
  }

  create(entityLike: DeepPartial<T>): T {
    return this.repository.create(entityLike);
  }

  async findAllWithPagination(
    pagination: BasePaginationQueryDto,
    searchableColumns: string[],
    options?: {
      where?: FindOptionsWhere<T>;
      select?: FindOptionsSelect<T>;
      relation?: FindOptionsRelations<T>;
      orderBy?: FindOptionsOrder<T>;
    }
  ): Promise<PaginationResponse<T>> {
    return await GetPagination(
      this.repository,
      pagination,
      searchableColumns,
      options
    );
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options);
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async runTransaction(
    callBack: (queryRunner: QueryRunner) => any,
    failBack?: () => any
  ): Promise<any> {
    const queryRunner = config.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callBack(queryRunner);

      await queryRunner.commitTransaction();
      Logger.debug('Transaction succeed');
      return result;
    } catch (exception) {
      Logger.log(exception);
      await queryRunner.rollbackTransaction();

      if (failBack) {
        await failBack();
      }

      Logger.error('Transaction failed');
      throw exception;
    } finally {
      await queryRunner.release();
      Logger.debug('Transaction done');
    }
  }

  async findOneBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<T | null> {
    return await this.repository.findOneBy(where);
  }

  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return await this.repository.findAndCount(options);
  }

  async exist(options?: FindManyOptions<T>): Promise<boolean> {
    return await this.repository.exist(options);
  }
}
