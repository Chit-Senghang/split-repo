import { Repository, ObjectLiteral, FindManyOptions } from 'typeorm';

export const paginationData = async <T extends ObjectLiteral>(
  repo: Repository<T>,
  options?: FindManyOptions<T>,
  returnOption?: (data: T[]) => any[]
) => {
  options.take = options.take || 10;

  if (options.order['undefined']) {
    options.order = {};
  }

  const [data, count] = await repo.findAndCount(options);

  return {
    data: returnOption ? returnOption(data) : data,
    pageMeta: {
      total: count,
      totalPage: Math.ceil(count / options.take),
      skip: options.skip,
      take: options.take,
      order: options.order
    }
  };
};
