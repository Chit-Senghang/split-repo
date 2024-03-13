import * as fs from 'fs';
import { join } from 'path';
import * as request from 'supertest';
import { HttpStatus, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { BulkTypeEnum } from '../../../apps/employee/src/bulk-import-document/enum/type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import {
  createCompanyStructureTree,
  getPositionLevelByName
} from '../../../test/common/common.e2e.service';
import { Employee } from '../../../apps/employee/src/employee/entity/employee.entity';
import { PositionLevelTitleEnum } from '../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';
import { CodeTypesEnum } from '../../../apps/employee/src/key-value/ts/enums/permission.enum';
import { CodeValue } from '../../../apps/employee/src/key-value/entity';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';

const downloadTemplate = async (
  accessToken: string,
  bulkType: BulkTypeEnum
) => {
  return await request(API_ENDPOINT)
    .get(`/employee/bulk-import-document/download-template/${bulkType}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.mimeType).not.toBeNull();
      expect(res.body.fileName).not.toBeNull();
      expect(res.body.file).not.toBeNull();
    })
    .expect(HttpStatus.OK);
};

const readExcelFile = async (
  fileName: string
): Promise<{
  workbook: ExcelJS.Workbook;
  filePath: string;
}> => {
  const filePath = join(__dirname, `${fileName}.xlsx`);
  Logger.log(filePath);

  return {
    workbook: await new ExcelJS.Workbook().xlsx.readFile(filePath),
    filePath
  };
};

//create employee with officer position
const createEmployeeOneSet = async (accessToken: string): Promise<Employee> => {
  const positionLevel = await getPositionLevelByName(
    PositionLevelTitleEnum.OFFICER,
    accessToken
  );
  const companyStructurePosition = await createCompanyStructureTree(
    positionLevel.id,
    accessToken,
    false,
    PositionLevelTitleEnum.OFFICER
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

const getCodeValueByType = async (
  accessToken: string,
  codeType: CodeTypesEnum
): Promise<CodeValue[]> => {
  const codeValueResponse = await request(API_ENDPOINT)
    .get(`/employee/code-value?code=${codeType}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));
  return codeValueResponse.body.data;
};

const uploadFile = async (
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

const createFileFromBase64 = async (fileName: string, base64File: string) => {
  try {
    Logger.log(join(__dirname, fileName));
    fs.createWriteStream(join(__dirname, fileName)).write(
      Buffer.from(base64File, 'base64')
    );
  } catch (error) {
    Logger.log(error);
  }
};

const downloadResultImport = async (accessToken: string) => {
  const bulkImportResponse = await request(API_ENDPOINT)
    .get(`/employee/bulk-import-document`)
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

export {
  downloadTemplate,
  readExcelFile,
  createEmployeeOneSet,
  getCodeValueByType,
  uploadFile,
  createFileFromBase64,
  downloadResultImport
};
