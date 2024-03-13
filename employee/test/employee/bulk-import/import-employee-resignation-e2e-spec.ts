import { join } from 'path';
import * as fsPromise from 'fs/promises';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import { BulkTypeEnum } from '../../../apps/employee/src/bulk-import-document/enum/type.enum';
import { FileName } from '../../../apps/employee/src/bulk-import-document/enum/file-name.enum';
import { EmployeeResignationStatusEnum } from '../../../apps/employee/src/employee-resignation/common/ts/enums/employee-resignation-status.enum';
import { StatusEnum } from '../../../apps/shared-resources/common/enums/status.enum';
import { EmployeeStatusEnum } from '../../../apps/employee/src/employee/enum/employee-status.enum';
import { WorkflowTypeEnum } from '../../../apps/shared-resources/common/enum/workflow-type.enum';
import { CodeValue } from '../../../apps/employee/src/key-value/entity';
import { getCurrentDateWithFormat } from '../../../apps/shared-resources/common/utils/date-utils';
import { CodeTypesEnum } from '../../../apps/employee/src/key-value/ts/enums/permission.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { getAccessToken } from '../../../test/common/common.e2e.service';
import {
  createEmployeeWithoutGivingPosition,
  createFileFromBase64,
  downloadBulkImportTemplate,
  downloadResultImport,
  readExcelFile,
  uploadBulkImportFile
} from './import.service';

describe('Test Import Employee Resignation', () => {
  let accessToken: string;
  let fileName: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
    //download template employee resignation
    const responseDownload = await downloadBulkImportTemplate(
      BulkTypeEnum.EMPLOYEE_RESIGNATION
    );

    fileName = responseDownload.body.fileName;
    createFileFromBase64(fileName, responseDownload.body.file);
  });

  afterAll(async () => {
    await fsPromise.unlink(join(__dirname, fileName));
    await fsPromise.unlink(
      join(__dirname, `${FileName.BULK_TIME_RESULT}.xlsx`)
    );
  });

  it('Import Resignation with New Employee', async () => {
    // create employee with position in company
    const employee = await createEmployeeWithoutGivingPosition(accessToken);

    const { workbook, filePath } = await readExcelFile('EmployeeResignation');

    // get resign type from code value
    const resignTypeResponse = await request(API_ENDPOINT)
      .get(`/employee/code-value?code=${CodeTypesEnum.RESIGNATION_TYPE}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));

    const resignType: CodeValue = resignTypeResponse.body.data.find(
      (item: CodeValue) => item.value === 'RESIGNED'
    );
    // insert a row to worksheet
    workbook
      .getWorksheet('Employee Resignation')
      .insertRow(2, [
        employee.id,
        employee.accountNo,
        employee.displayFullNameEn,
        getCurrentDateWithFormat(),
        resignType.value
      ]);

    //save change to worksheet
    await workbook.xlsx.writeFile(filePath);

    //upload file
    await uploadBulkImportFile(
      accessToken,
      filePath,
      MediaEntityTypeEnum.RESIGNATION_REQUEST
    );

    //upload file resign duplicate employee
    await request(API_ENDPOINT)
      .post(`/employee/bulk-import-document`)
      .attach('file', filePath)
      .field({ entityType: WorkflowTypeEnum.RESIGNATION_REQUEST })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    //download result file and add to directory
    const base46 = await downloadResultImport(
      accessToken,
      MediaEntityTypeEnum.RESIGNATION_REQUEST
    );
    createFileFromBase64('BULK_TIME_RESULT.xlsx', base46.replace('base64', ''));

    //verify employee whether has been resigned or not
    await request(API_ENDPOINT)
      .get(`/employee/employee-master-information/${employee.id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect(async (res) => {
        const { workbook } = await readExcelFile(FileName.BULK_TIME_RESULT);

        const worksheet = workbook.getWorksheet('Failed Records');
        const message = worksheet.getCell('G2').value;
        const result = worksheet.getCell('F2').value;
        expect(result).toEqual('FAILED');
        expect(message).toEqual(`ACCOUNT NO ${employee.accountNo} not found.`); // expect this because employee has already been resigned
        expect(res.body.data.id).toEqual(employee.id);
        expect(res.body.data.status).toEqual(EmployeeStatusEnum.RESIGNED);
      });

    //verify record in employee resignation
    await request(API_ENDPOINT)
      .get(
        `/employee/employee-resignation?employeeId=${employee.id}&status=${EmployeeResignationStatusEnum.ACTIVE}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.at(0).employee.id).toEqual(employee.id);
        expect(res.body.data.at(0).status).toEqual(StatusEnum.ACTIVE);
        expect(res.body.data.at(0).reason).toEqual('Import');
        expect(res.body.data.at(0).resignTypeId.id).toEqual(resignType.id);
        expect(res.body.data.at(0).resignDate).toEqual(
          getCurrentDateWithFormat()
        );
      });
  });
});
