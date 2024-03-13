import * as ExcelJS from 'exceljs';
import { camelCase } from 'lodash';
import { ResourceBadRequestException } from '../../../exception/badRequest.exception';
import {
  ExportDataTypeEnum,
  HeaderFixedKeyEnum,
  LeaveRemainReportTypeEnum
} from '../enum/export.enum';
// import { ExportFileDto } from '../../dto/export-file.dto';
import { ColumnDefinitionDto } from '../../dto/column-definition.dto';
import { DataTableNameEnum } from '../enum/data-table-name.enum';
// import { exportPdfTemplate } from './export-pdf-template';

export const exportFilesByType = async (
  exportType: string,
  data: any,
  wb: ExcelJS.Workbook
  // dataTableName: string,
  // exportFileDto: ExportFileDto
): Promise<ExcelJS.Buffer | Buffer> => {
  switch (exportType) {
    case ExportDataTypeEnum.EXCEL:
      return await wb.xlsx.writeBuffer();
    case ExportDataTypeEnum.CSV:
      return await wb.csv.writeBuffer();
    // case ExportDataTypeEnum.PDF:
    //   return await exportPdfTemplate(
    //     data,
    //     dataTableName,
    //     exportFileDto.headers
    //   );
    default:
      throw new ResourceBadRequestException(
        exportType,
        `export type ${exportType} not supported`
      );
  }
};

const getValueFromProp = (keys: string[], data: any): any => {
  const arrayNestedObjectRex: RegExp = /\[\d+\]/;
  let nestedValue: any = data;
  for (const key of keys) {
    if (arrayNestedObjectRex.test(key)) {
      const index: string = key.match(/\d+/)[0];
      const arrayKey: string = key.split('[')[0];
      nestedValue = nestedValue[arrayKey][index] ?? '-';
    } else if (key.match(/`|'/) && key.match(/ /)) {
      return key.at(1); // get space
    } else if (key.match(/`|'/)) {
      return key.replace(/['|`]/g, ``); // remove `` and ''
    } else {
      nestedValue = nestedValue[key] ?? '-';
    }
  }
  return nestedValue;
};

const splitProperty = (path: string, commaRegex: RegExp): string[] => {
  if (commaRegex.test(path)) {
    return path.split(',');
  } else {
    return path.split('.');
  }
};

const getNestedProperty = (data: any, path: string): string => {
  const commaRegex: RegExp = /,/;
  const keys: string[] = splitProperty(path, commaRegex);
  let result: string = ``;
  if (keys.length) {
    if (commaRegex.test(path)) {
      const concatKeys: string[][] = keys.map((path) =>
        splitProperty(path, commaRegex)
      );
      for (const concatKey of concatKeys) {
        result += getValueFromProp([...concatKey], data);
      }
    } else {
      result = getValueFromProp(keys, data);
    }
  }
  return result;
};

export const getRows = (
  data: any,
  columnDefinitions: ColumnDefinitionDto[],
  dataTableName: string
): any => {
  const rows = [];
  data.forEach((item: any, index: number) => {
    const leaveRemainReportType: LeaveRemainReportTypeEnum[] = Object.values(
      LeaveRemainReportTypeEnum
    );
    switch (dataTableName) {
      case DataTableNameEnum.LEAVE_REMAIN_REPORT:
        for (const leaveRemainCell of leaveRemainReportType) {
          rows.push(
            generateColumns(
              columnDefinitions,
              item,
              index,
              dataTableName,
              leaveRemainCell
            )
          );
        }
        break;
      case DataTableNameEnum.BENEFIT_INCREMENT_POLICY:
        if (item.detail.length) {
          item.detail.forEach((element: any, detailIndex: number) => {
            rows.push(
              generateColumns(
                columnDefinitions,
                item,
                index,
                dataTableName,
                null,
                detailIndex
              )
            );
          });
        }
        break;
      default:
        rows.push(
          generateColumns(columnDefinitions, item, index, dataTableName)
        );
    }
  });
  return rows;
};

const generateColumns = (
  columnDefinitions: ColumnDefinitionDto[],
  parentData: any,
  index: number,
  dataTableName: string,
  typeCell?: string,
  subIndex?: number
): any => {
  const isNotRemainOrUsed: boolean =
    typeCell !== LeaveRemainReportTypeEnum.USED ??
    typeCell !== LeaveRemainReportTypeEnum.AVAILABLE;
  const subIndexGreaterThanZero: boolean = subIndex > 0; // Not repeat return parent value
  const rowsData = columnDefinitions.map((column: ColumnDefinitionDto) => {
    const value = getNestedProperty(parentData, column.key);
    if (column.key === HeaderFixedKeyEnum.NO && isNotRemainOrUsed) {
      return !subIndexGreaterThanZero ? (index += 1) : null;
    } else if (Array.isArray(value)) {
      if (dataTableName === DataTableNameEnum.LEAVE_REMAIN_REPORT) {
        return generateColumnByLeaveRemainReport(value, column, typeCell);
      } else if (dataTableName === DataTableNameEnum.BENEFIT_INCREMENT_POLICY) {
        return generateColumnByBenefitIncreasementPolicy(
          value,
          column,
          subIndex
        );
      }
    } else if (typeof value === 'boolean') {
      return String(value);
    } else if (column.header === HeaderFixedKeyEnum.INFO) {
      return typeCell === LeaveRemainReportTypeEnum.AVAILABLE
        ? LeaveRemainReportTypeEnum.AVAILABLE
        : LeaveRemainReportTypeEnum.USED;
    } else if (isNotRemainOrUsed) {
      return !subIndexGreaterThanZero ? value : null;
    }
  });
  return rowsData;
};

const generateColumnByBenefitIncreasementPolicy = (
  value: any,
  column: ColumnDefinitionDto,
  subIndex: number
): string => {
  const matchingValues = value.filter((val: any) =>
    Object.prototype.hasOwnProperty.call(val, camelCase(column.header))
  );
  let result: string = ``;
  if (matchingValues) {
    if (camelCase(column.header) === `benefitComponent`) {
      result = matchingValues[subIndex]?.benefitComponent?.name;
    } else {
      result = matchingValues[subIndex]?.increasementAmount;
    }
  }
  return result;
};

const generateColumnByLeaveRemainReport = (
  value: any,
  column: ColumnDefinitionDto,
  typeCell: string
): any => {
  const matchingValues = value.filter(
    (val: any) => val.leaveType.name === column.header
  );
  let result = ``;
  if (matchingValues.length) {
    result =
      typeCell === LeaveRemainReportTypeEnum.USED
        ? matchingValues[0].leaveType.used
        : matchingValues[0].leaveType.remaining;
  }
  return result;
};
