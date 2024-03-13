import { instanceToPlain } from 'class-transformer';
import {
  EntityPropertyNotFoundError,
  FindOperator,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  ObjectLiteral,
  Repository
} from 'typeorm';
import * as _ from 'lodash';
import { Logger } from '@nestjs/common';
import { PaginationResponse } from '../ts/interface/response.interface';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_OFFSET
} from '../ts/constants/pagination.constants';
import { BasePaginationQueryDto } from '../common/dto/base-pagination-query.dto';
import { PAGINATION_ORDER_DIRECTION } from '../ts/enum/pagination-order-direction.enum';
import { ResourceBadRequestException } from '../exception/badRequest.exception';

export async function GetPagination<
  T extends ObjectLiteral,
  U extends ObjectLiteral,
  V
>(
  repo: Repository<T>,
  paginationQuery: BasePaginationQueryDto,
  searchableColumns: string[],
  options?: {
    // TODO: this might change to map of array in the future, as searchableChildColumns.
    childSearchColumn?: string;
    childWhere?: FindOptionsWhere<U>;
    where?: FindOptionsWhere<T>;
    select?: FindOptionsSelect<T>;
    relation?: FindOptionsRelations<T>;
    orderBy?: FindOptionsOrder<T>;
    mapFunction?: (input: T, index?: number) => V;
  }
) {
  const { offset, limit, keywords, orderBy } = paginationQuery;

  const searchKeywords: FindOptionsWhere<T>[] = [];

  if (searchableColumns.length && keywords) {
    searchKeywords.push(...handleFullTextSearch(searchableColumns, keywords));
  }

  const whereCondition = options?.where ?? ({} as FindOptionsWhere<T>);
  const sortableColumns = _.merge(
    {},
    options?.orderBy,
    handleSortableColumns(orderBy) as FindOptionsOrder<T>
  );
  const paginationOptions = {
    skip: offset ?? DEFAULT_PAGINATION_OFFSET,
    take: limit ?? DEFAULT_PAGINATION_LIMIT,
    where: handleFindOptionsWhere(searchKeywords, whereCondition),
    select: options?.select ?? {},
    order: sortableColumns,
    relations: options?.relation ?? {}
  };

  // for export data all
  if (!limit) {
    paginationOptions.take = 0;
  }

  try {
    const [data, totalCount] = await repo.findAndCount(paginationOptions);
    return {
      totalCount,
      data: options?.mapFunction
        ? await Promise.all(
            data
              .map((record, index) => options?.mapFunction(record, index))
              // eslint-disable-next-line eqeqeq
              .filter((record) => record != null)
          )
        : instanceToPlain(data)
    } as PaginationResponse<T>;
  } catch (error) {
    if (error instanceof EntityPropertyNotFoundError) {
      Logger.error('Invalid column error:', error);
      throw new ResourceBadRequestException('Invalid column name or property');
    }
    throw error;
  }
}

export function generateSortableColumnQuery(
  sortColumn: string,
  sortDirection: string
): string {
  const sortableColumns = sortColumn.split('.');

  let sortQuery = '';
  let closeBracket = '';

  // convert sort columns to script
  sortableColumns.forEach((column: string) => {
    sortQuery = sortQuery.concat(`{"${column}":`);
    closeBracket = closeBracket.concat('}');
  });

  return (sortQuery = sortQuery.concat(`"${sortDirection}"${closeBracket}`));
}

export function handleFindOptionsWhere(
  searchArray: FindOptionsWhere<any>[],
  whereCondition: FindOptionsWhere<any>
) {
  let findWhereOptions = searchArray;
  if (findWhereOptions.length) {
    findWhereOptions.forEach((keyword: FindOptionsWhere<any>) => {
      if (Array.isArray(whereCondition)) {
        findWhereOptions.push(
          ...whereCondition.map((condition: FindOptionsWhere<any>) => {
            return _.merge(keyword, condition);
          })
        );
      } else {
        findWhereOptions.push(_.merge(keyword, whereCondition));
      }
    });
  } else if (Array.isArray(whereCondition)) {
    findWhereOptions.push(...whereCondition);
  } else {
    findWhereOptions = whereCondition as any;
  }

  return findWhereOptions;
}

export function handleFullTextSearch(
  searchableColumns: string[],
  keyword: string
) {
  const findOptions = [];
  searchableColumns.forEach((searchableColumn: string) => {
    if (searchableColumn.includes('.')) {
      const tempObj = generateQueryFullTextSearch(searchableColumn, keyword);
      findOptions.push(mappingObject(JSON.parse(tempObj), keyword));
    } else {
      findOptions.push({ [searchableColumn]: ILike(`%${keyword}%`) });
    }
  });

  return findOptions;
}

export function mappingObject(tempObj: object, keyword: string) {
  for (const [key, value] of Object.entries(tempObj)) {
    if (typeof value === 'object') {
      mappingObject(value, keyword);
    } else {
      tempObj[key] = ILike(`%${keyword}%`) as FindOperator<any>;
    }
  }

  return tempObj;
}

export function generateQueryFullTextSearch(
  searchColumn: string,
  keyword: string
) {
  const sortableColumns = searchColumn.split('.');

  let sortQuery = '';
  let closeBracket = '';

  // convert sort columns to script
  sortableColumns.forEach((column: string) => {
    sortQuery = sortQuery.concat(`{"${column}":`);
    closeBracket = closeBracket.concat('}');
  });

  return (sortQuery = sortQuery.concat(`"${keyword}"${closeBracket}`));
}

export function handleSortableColumns(orderBy: string) {
  if (!orderBy) {
    return { id: PAGINATION_ORDER_DIRECTION.DESC };
  }
  let obj: any;

  orderBy.split(',').forEach((sortableColumns: string) => {
    for (const sortField of sortableColumns.split(' ')) {
      const [sortColumn, sortDirection] = sortField.split(':');
      const formattedColumn = handleCompanyStructureSortableColumns(sortColumn);
      const tempObj: string = generateSortableColumnQuery(
        formattedColumn,
        sortDirection
      );
      obj = _.merge(obj, JSON.parse(tempObj));
    }
  });

  return obj;
}

const companyStructureSortableColumns = {
  'employee.location':
    'employee.positions.companyStructureLocation.companyStructureComponent.name',
  'employee.outlet':
    'employee.positions.companyStructureOutlet.companyStructureComponent.name',
  'employee.department':
    'employee.positions.companyStructureDepartment.companyStructureComponent.name',
  'employee.team':
    'employee.positions.companyStructureTeam.companyStructureComponent.name',
  'employee.position':
    'employee.positions.companyStructurePosition.companyStructureComponent.name',
  gender: 'gender.value'
};

const handleCompanyStructureSortableColumns = (columnDefinition: string) => {
  const columnValue = companyStructureSortableColumns[columnDefinition];
  if (columnValue) {
    return columnValue;
  } else {
    return columnDefinition.replace('[0]', '');
  }
};
