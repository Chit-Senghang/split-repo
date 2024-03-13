import { join } from 'path';
import * as fsPromise from 'fs/promises';
import {
  getAccessToken,
  getRandomString,
  getReasonTemplateTypeOTHER
} from '../../../common/common.e2e.service';
import {
  createEmployeeOneSet,
  createFileFromBase64,
  downloadTemplate,
  getCodeValueByType,
  readExcelFile,
  uploadFile,
  downloadResultImport
} from '../bulk-import-common.service';
import { BulkTypeEnum } from '../../../../apps/employee/src/bulk-import-document/enum/type.enum';
import { FileName } from '../../../../apps/employee/src/bulk-import-document/enum/file-name.enum';
import { CodeTypesEnum } from '../../../../apps/employee/src/key-value/ts/enums/permission.enum';
import { getCurrentDateWithFormat } from '../../../../apps/shared-resources/common/utils/date-utils';
import { CodeValue } from '../../../../apps/employee/src/key-value/entity';
import { ReasonTemplate } from '../../../../apps/employee/src/reason-template/entities/reason-template.entity';
import { MediaEntityTypeEnum } from '../../../../apps/employee/src/media/common/ts/enums/entity-type.enum';

describe('Test Import Employee Resignation', () => {
  let accessToken: string;
  let fileName: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    //download template
    const responseDownload = await downloadTemplate(
      accessToken,
      BulkTypeEnum.WARNING
    );
    fileName = responseDownload.body.fileName;
    createFileFromBase64(fileName, responseDownload.body.file);
  });

  it('Import Warning', async () => {
    //create employee
    const employee = await createEmployeeOneSet(accessToken);

    //create workbook
    const { workbook, filePath } = await readExcelFile('EmployeeWarning');

    //get warning type and reason template
    const warningTypeCodeValues: CodeValue[] = await getCodeValueByType(
      accessToken,
      CodeTypesEnum.WARNING_TYPE
    );
    const reasonTemplateTypeOther: ReasonTemplate =
      await getReasonTemplateTypeOTHER(accessToken);

    //insert a row to worksheet
    workbook
      .getWorksheet('Employee Warning')
      .insertRow(2, [
        employee.id,
        employee.accountNo,
        employee.displayFullNameEn,
        getRandomString(),
        warningTypeCodeValues[0].value,
        getCurrentDateWithFormat(),
        reasonTemplateTypeOther.name
      ]);

    //save and upload
    await workbook.xlsx.writeFile(filePath);
    await uploadFile(accessToken, filePath, MediaEntityTypeEnum.WARNING);

    //download import result
    const base46 = await downloadResultImport(accessToken);
    createFileFromBase64('BULK_TIME_RESULT.xlsx', base46.replace('base64', ''));
  });

  afterAll(async () => {
    if (fileName) {
      await fsPromise.unlink(
        join(__dirname.replace('/import-warning', ''), fileName)
      );
      await fsPromise.unlink(
        join(
          __dirname.replace('/import-warning', ''),
          `${FileName.BULK_TIME_RESULT}.xlsx`
        )
      );
    }
  });
});
