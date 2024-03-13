import * as ExcelJS from 'exceljs';
import { ExportFileDto } from '../../dto/export-file.dto';
import { getRows, exportFilesByType } from './export-function';

export const exportDataFiles = async (
  exportType: string,
  dataTableName: string,
  exportFileDto: ExportFileDto,
  data: any
): Promise<ExcelJS.Buffer | Buffer> => {
  const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
  const worksheet: ExcelJS.Worksheet = workbook.addWorksheet(
    dataTableName.toLocaleLowerCase()
  );

  // Add custom headers to the worksheet
  // Add "No" column definition as the first element
  const columnDefinitions = exportFileDto.headers;
  columnDefinitions.unshift({
    header: 'No',
    key: 'no'
  });
  const headers = columnDefinitions.map((column) => column.header);
  const headerRow = worksheet.addRow(headers);

  // Set properties for the header row
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
  });

  // Add rows to excel
  const rows = getRows(data, columnDefinitions, dataTableName);
  worksheet.addRows(rows);

  // Apply formatting to the "No" column (column 'A' in this case)
  worksheet.getColumn('A').eachCell((cell) => {
    cell.alignment = { horizontal: 'left' };
  });

  // Auto resize all columns
  worksheet.columns.forEach((column: ExcelJS.Column) => {
    let maxCellWidth = 6;
    const headerWidth = column.header ? String(column.header).length : 0;
    maxCellWidth = Math.max(maxCellWidth, headerWidth);
    column.eachCell({ includeEmpty: false }, (cell: any) => {
      const cellWidth = cell.text ? String(cell.text).length : 0;
      maxCellWidth = Math.max(maxCellWidth, cellWidth);
    });
    column.width = maxCellWidth + 2;
  });

  return await exportFilesByType(
    exportType,
    data,
    workbook
    // dataTableName,
    // exportFileDto
  );
};
