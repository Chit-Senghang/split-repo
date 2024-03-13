import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner
} from 'typeorm';
import { PaginationResponse } from '../../../ts/interface/response.interface';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';

export interface IRepositoryBase<T> {
  save(entity: T): Promise<T>;

  findOne(options: FindOneOptions<T>): Promise<T | null>;

  find(options?: FindManyOptions<T>): Promise<T[]>;

  delete(id: number): Promise<void>;

  softDelete(id: number): Promise<void>;

  findAllWithPagination(
    pagination: BasePaginationQueryDto,
    searchableColumns: string[],
    options?: {
      where?: FindOptionsWhere<T>;
      select?: FindOptionsSelect<T>;
      relation?: FindOptionsRelations<T>;
      orderBy?: FindOptionsOrder<T>;
      mapFunction?: (data: T, index?: number) => any;
    }
  ): Promise<PaginationResponse<T>>;

  create(entityLike: DeepPartial<T>): T; // This is for creating entity instance before save so that we do not need to inject repository in service

  query(query: string, parameters?: any[]): Promise<any>; // For some cases, we need to use raw query

  runTransaction(
    callBack: (queryRunner: QueryRunner) => any,
    failBack?: () => any
  ): Promise<any>;
  findOneBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<T | null>;
  findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
  exist(options?: FindManyOptions<T>): Promise<boolean>;
}
