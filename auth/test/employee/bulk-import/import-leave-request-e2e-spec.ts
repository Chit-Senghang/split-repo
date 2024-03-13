import { join } from 'path';
import * as fsPromise from 'fs/promises';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { StatusEnum } from '../../../apps/shared-resources/common/enums/status.enum';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import { DEFAULT_DATE_FORMAT } from '../../../apps/shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../../apps/shared-resources/common/utils/date-utils';
import { LeaveRequestDurationTypeEnEnum } from '../../../apps/employee/src/leave/leave-request/enums/leave-request-duration-type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { LeaveTypeVariation } from '../../../apps/employee/src/leave/leave-request-type/entities/leave-type-variation.entity';
import { BulkTypeEnum } from '../../../apps/employee/src/bulk-import-document/enum/type.enum';
import { getAccessToken } from '../../../test/common/common.e2e.service';
import { FileName } from '../../../apps/employee/src/bulk-import-document/enum/file-name.enum';
import {
  createEmployeeWithoutGivingPosition,
  createFileFromBase64,
  downloadBulkImportTemplate,
  downloadResultImport,
  readExcelFile
} from './import.service';

describe('Import Leave Request', () => {
  let accessToken: string;
  let fileName: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
    //download template employee resignation
    const responseDownload = await downloadBulkImportTemplate(
      BulkTypeEnum.LEAVE_REQUEST
    );

    fileName = responseDownload.body.fileName;
    createFileFromBase64(fileName, responseDownload.body.file);
  });

  afterAll(async () => {
    if (fileName) {
      await fsPromise.unlink(join(__dirname, fileName));
      await fsPromise.unlink(
        join(__dirname, `${FileName.BULK_TIME_RESULT}.xlsx`)
      );
    }
  });

  it('Import Leave Request with New Employee', async () => {
    // create employee with position in company
    const employee = await createEmployeeWithoutGivingPosition(accessToken);

    const { workbook: leaveRequestWorksheet, filePath } = await readExcelFile(
      'EmployeeLeaveRequest'
    );

    const leaveTypeVariation: LeaveTypeVariation = await getLeaveRequestType(
      accessToken,
      employee.id
    );

    //INSERT: data into worksheet
    leaveRequestWorksheet.getWorksheet('Employee Leave Request').insertRow(2, [
      employee.id,
      employee.accountNo,
      employee.displayFullNameEn,
      leaveTypeVariation.leaveType.id +
        '-' +
        leaveTypeVariation.leaveType.leaveTypeName,
      LeaveRequestDurationTypeEnEnum.DATE_RANGE,
      getCurrentDateWithFormat(),
      dayJs(getCurrentDateWithFormat())
        .add(1, 'day')
        .format(DEFAULT_DATE_FORMAT) //DATE: for tomorrow,
    ]);

    //SAVE: data in worksheet
    await leaveRequestWorksheet.xlsx.writeFile(filePath);

    //UPLOAD: file leave request
    await request(API_ENDPOINT)
      .post(`/employee/bulk-import-document`)
      .attach('file', filePath)
      .field({ entityType: MediaEntityTypeEnum.LEAVE_REQUEST })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    //DOWNLOAD: result file and add to directory
    const base46 = await downloadResultImport(
      accessToken,
      MediaEntityTypeEnum.LEAVE_REQUEST
    );
    createFileFromBase64('BULK_TIME_RESULT.xlsx', base46.replace('base64', ''));

    //VERIFY: leave request record
    await request(API_ENDPOINT)
      .get(`/employee/leave-request?employeeId${employee.id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect(async (res) => {
        const { workbook } = await readExcelFile(FileName.BULK_TIME_RESULT);
        const worksheet = workbook.getWorksheet('Failed Records');
        const message = worksheet.getCell('J2').value;
        const result = worksheet.getCell('K2').value;
        expect(message).toBeNull();
        expect(result).toBeNull();
        expect(res.body.data.at(0).employee.id).toEqual(employee.id);
        expect(res.body.data.at(0).reason).toEqual('Import Leave Request');
        expect(res.body.data.at(0).status).toEqual(StatusEnum.ACTIVE);
      });
  });
});

const getLeaveRequestType = async (
  accessToken: string,
  employeeId: number
): Promise<LeaveTypeVariation> => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/leave-request-type/employee/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.length).not.toBeNull());

  return response.body.data.find(
    (leaveTypeVariation: LeaveTypeVariation) =>
      !leaveTypeVariation.leaveType.isPublicHoliday
  );
};
