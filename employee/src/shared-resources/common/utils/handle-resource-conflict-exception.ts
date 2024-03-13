import { QueryFailedError } from 'typeorm';
import { ResourceConflictException } from '../../exception/conflict-resource.exception';
import { IResourceException } from '../../ts/interface/resource-exception.interface';
import { PostgresqlStatusCode } from '../../ts/enum/postgres-status-code.enum';

export const handleResourceConflictException = (
  exception: any,
  resourceConflictExceptions: IResourceException[],
  dto?: any
) => {
  exception instanceof QueryFailedError;
  if (
    exception.driverError?.code.includes(PostgresqlStatusCode.UNIQUE_VIOLATION)
  ) {
    for (const resourceConflictException of resourceConflictExceptions) {
      const { path } = resourceConflictException;
      const { arrayProperty, key } = resourceConflictException;
      const exceptionSql = exception.driverError.detail;

      if (arrayProperty && exception.message.includes(key)) {
        if (Array.isArray(arrayProperty)) {
          for (const prop of arrayProperty) {
            handleArrayProperty(dto, prop, exceptionSql, path);
          }
        } else {
          handleArrayProperty(dto, arrayProperty, exceptionSql, path);
        }
      } else {
        if (exception.message.includes(key)) {
          throw new ResourceConflictException(path);
        }
      }
    }
  }
  throw exception;
};

const handleArrayProperty = (
  dto: any,
  prop: string,
  exceptionSql: any,
  path: string
) => {
  const OBJECT = `object`;
  const keyAndValueFromExceptionSql =
    getKeyAndValueFromExceptionSql(exceptionSql);

  // get value from dto each property
  const valueFromDto = dto[prop];

  // get key and value convert to array
  const keyFromExceptionSql = keyAndValueFromExceptionSql[0].split(',');
  const valueFromExceptionSql = keyAndValueFromExceptionSql[1].split(',');

  for (const keyFromSql of keyFromExceptionSql) {
    for (const valueFromSql of valueFromExceptionSql) {
      // check property if the array value or an object
      if (typeof valueFromDto[0] === OBJECT) {
        // search duplicate value
        valueFromDto.forEach((data: any, index: number | string) => {
          if (String(data[toCamelCase(keyFromSql)]) === valueFromSql.trim()) {
            path += `,${prop}[${index}].${toCamelCase(keyFromSql)}`;
          }
        });
      } else {
        // find index each dto
        const index = valueFromDto.indexOf(valueFromSql.trim());
        const searchDuplicateValue: boolean = valueFromDto.includes(
          valueFromSql.trim()
        );

        if (searchDuplicateValue) {
          path += `,${prop}[${index}]`;
        }
      }
    }
  }
  throw new ResourceConflictException(String(removeDuplicatePath(path)));
};

const getKeyAndValueFromExceptionSql = (errorMessage: string) => {
  // regular expression
  const regex = /\((.*?)\)/g;
  const matches = errorMessage.match(regex);

  if (matches) {
    const keyAndValueFromExceptionSql = matches.map((match) =>
      match.slice(1, -1)
    );

    // output: ["key", "value"]
    return keyAndValueFromExceptionSql;
  }
};

const toCamelCase = (keyName: string) => {
  return keyName
    .replace(/_([a-z])/g, (_match, param) => param.toUpperCase())
    .trim();
};

const removeDuplicatePath = (path: string) => {
  let newPath = ``;
  new Set(path.split(',')).forEach((value) => {
    if (value) {
      newPath += `,${value}`;
    }
  });

  return newPath.replace(`,`, '');
};
