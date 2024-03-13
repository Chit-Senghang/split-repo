import { join } from 'path';
import * as fs from 'fs';
import { HttpStatus, Logger } from '@nestjs/common';
import * as request from 'supertest';
import * as ExcelJS from 'exceljs';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import { PositionLevelTitleEnum } from '../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import { Employee } from '../../../apps/employee/src/employee/entity/employee.entity';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { BulkTypeEnum } from '../../../apps/employee/src/bulk-import-document/enum/type.enum';
import {
  createCompanyStructureTree,
  getAccessToken,
  getPositionLevelByName
} from '../../../test/common/common.e2e.service';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';

export const downloadBulkImportTemplate = async (type: BulkTypeEnum) => {
  const accessToken = await getAccessToken();
  return await request(API_ENDPOINT)
    .get(`/employee/bulk-import-document/download-template/${type}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.mimeType).not.toBeNull();
      expect(res.body.fileName).not.toBeNull();
      expect(res.body.file).not.toBeNull();
    })
    .expect(HttpStatus.OK);
};

export const createFileFromBase64 = (fileName: string, base64File: string) => {
  try {
    fs.createWriteStream(join(__dirname, fileName)).write(
      Buffer.from(base64File, 'base64')
    );
  } catch (error) {
    Logger.log(error);
  }
};

export const downloadResultImport = async (
  accessToken: string,
  entityType: MediaEntityTypeEnum
) => {
  const bulkImportResponse = await request(API_ENDPOINT)
    .get(`/employee/bulk-import-document?entityType=${entityType}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.length).not.toBeNull());
  const mediaResponse = await request(API_ENDPOINT)
    .get(
      `/employee/media?entityId=${
        bulkImportResponse.body.data.at(0).id
      }&entityType=${MediaEntityTypeEnum.BULK_IMPORT_RESULT}`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK);
  const response = await request(API_ENDPOINT)
    .get(`/employee/media/download/${mediaResponse.body.data.at(0).name}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data).not.toBeNull());

  return response.text.split(';').at(1);
};

export const readExcelFile = async (
  fileName: string
): Promise<{
  workbook: ExcelJS.Workbook;
  filePath: string;
}> => {
  const filePath = join(__dirname, `${fileName}.xlsx`);

  return {
    workbook: await new ExcelJS.Workbook().xlsx.readFile(filePath),
    filePath
  };
};

export const createEmployeeWithoutGivingPosition = async (
  accessToken: string
): Promise<Employee> => {
  const positionLevel = await getPositionLevelByName(
    PositionLevelTitleEnum.INTERN,
    accessToken
  );

  const companyStructurePosition = await createCompanyStructureTree(
    positionLevel.id,
    accessToken,
    false,
    PositionLevelTitleEnum.INTERN
  );
  const employeeId = await createEmployee(
    companyStructurePosition.id,
    accessToken
  );
  const responseEmployee = await request(API_ENDPOINT)
    .get(`/employee/employee-master-information/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.id).toEqual(employeeId));

  return responseEmployee.body.data;
};

export const uploadBulkImportFile = async (
  accessToken: string,
  filePath: string,
  entityType: MediaEntityTypeEnum
) => {
  await request(API_ENDPOINT)
    .post(`/employee/bulk-import-document`)
    .attach('file', filePath)
    .field({ entityType })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED);
};
