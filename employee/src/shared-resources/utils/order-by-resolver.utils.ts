import { PAGINATION_ORDER_DIRECTION } from '../ts/enum/pagination-order-direction.enum';

export interface OrderByOption {
  key: string;
  originalKey?: string;
}

function orderByQuery(orderBy: string, orderDirection: string) {
  let newOrderBy: any = '';
  const key = 'id';
  const value = orderDirection ?? PAGINATION_ORDER_DIRECTION.DESC;
  if (orderBy && orderBy.includes('.')) {
    const orderByData = orderBy.split('.');

    let closeBracket = '}';
    orderByData.map((order: string, index: number) => {
      if (index === 0) {
        newOrderBy = `{"${order}"`;
      } else {
        closeBracket = closeBracket + '}';
        if (index !== orderByData.length - 1) {
          newOrderBy = newOrderBy + `:{"${order}"`;
        } else {
          newOrderBy =
            newOrderBy + `:{"${order ?? key}": "${value}"${closeBracket}`;
        }
      }
    });
  } else {
    newOrderBy = `{"${[orderBy ?? key]}":"${value}"}`;
  }

  return JSON.parse(newOrderBy);
}

function getOrderByKeys(orderByOptions: any) {
  if (validateArray(orderByOptions)) {
    return orderByOptions.map((option: any) => {
      return option['key'];
    });
  }
}

function handlePaginationOrderBy(pagination: any, orderByOptions: any) {
  if (validateArray(orderByOptions) && pagination.orderBy) {
    orderByOptions.forEach((option: any) => {
      if (pagination.orderBy === option.key) {
        pagination.orderBy = option?.originalKey ?? option?.key;
      }
    });
  }
}

function validateArray(array: any) {
  if (!Array.isArray(array) || !array.length) {
    return;
  }

  return true;
}

export { getOrderByKeys, validateArray, handlePaginationOrderBy, orderByQuery };
