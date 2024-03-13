import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_OFFSET
} from '../ts/constants/pagination.constants';

export const paginationGrpc = async <T extends ObjectLiteral>(
  repo: Repository<T>,
  option?: { where?: FindOptionsWhere<T> },
  offset?: number,
  limit?: number
) => {
  // eslint-disable-next-line prefer-const
  let [data, totalCount] = await repo.findAndCount({
    skip: offset ?? DEFAULT_PAGINATION_OFFSET,
    take: limit ?? DEFAULT_PAGINATION_LIMIT,
    where: { ...(option?.where ?? {}) } as FindOptionsWhere<T>
  });
  const newOffset: number = Number(offset) || DEFAULT_PAGINATION_OFFSET;
  const newLimit: number = Number(limit) || DEFAULT_PAGINATION_LIMIT;
  const currentPage =
    offset >= totalCount ? 0 : Math.floor(newOffset / newLimit) + 1;
  const totalPage = Math.floor(totalCount / newLimit);
  const lastPage = totalPage <= 2 ? 0 : Math.floor(totalCount / newLimit);
  return {
    data: data,
    pageMeta: {
      totalCount: totalCount,
      pageSize: newLimit,
      currentPage: currentPage,
      nextPage: currentPage >= lastPage ? null : currentPage + 1,
      prevPage: currentPage <= 1 ? null : currentPage - 1,
      lastPage
    }
  };
};
