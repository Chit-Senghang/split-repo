import * as crypto from 'node:crypto';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import {
  createEmployeeWithCompanyStructure,
  getAccessToken
} from '../../common/common.e2e.service';
import { CodeTypesEnum } from '../../../apps/employee/src/key-value/ts/enums/permission.enum';
import { DEFAULT_DATE_FORMAT } from '../../../apps/shared-resources/common/dto/default-date-format';
import { dayJs } from '../../../apps/shared-resources/common/utils/date-utils';

describe('Employee Identifier Test', () => {
  let accessToken: string, codeValue: { id: number }[];
  const randomValue = crypto.randomUUID();

  const getCodeValue = async () => {
    const response = await request(API_ENDPOINT)
      .get(`/employee/code-value?code=${CodeTypesEnum.DOCUMENT_TYPE}`)
      .set(AUTHORIZATION_KEY, accessToken);
    if (response.body.data) {
      codeValue = response.body.data;
    } else {
      return 'code value does`t not exist';
    }
  };

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await getCodeValue();
  });

  it('Test get employee Identifier', async () => {
    const description = randomValue;
    const documentIdentifier = randomValue;
    const documentTypeId = codeValue[0].id;
    const expireDate = dayJs(new Date()).format(DEFAULT_DATE_FORMAT);
    const employeeId = await createEmployeeWithCompanyStructure(accessToken);

    const sendData = {
      description,
      documentIdentifier,
      documentTypeId,
      expireDate,
      employeeId
    };

    const response = await request(API_ENDPOINT)
      .post(`/employee/${employeeId}/employee-identifier`)
      .send(sendData)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = response.body.data.id;
    // get one
    await request(API_ENDPOINT)
      .get(`/employee/${employeeId}/employee-identifier/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          documentIdentifier,
          expireDate: dayJs(res.body.data.expireDate).format(
            DEFAULT_DATE_FORMAT
          ),
          description,
          documentTypeId: {
            id: documentTypeId
          },
          employeeId: {
            id: employeeId
          }
        });
      })
      .expect(HttpStatus.OK);

    // update
    const sendDataUpdate = {
      description: 'i test you',
      documentIdentifier: 'i miss you',
      documentTypeId,
      expireDate,
      employeeId
    };
    await request(API_ENDPOINT)
      .patch(`/employee/${employeeId}/employee-identifier/${id}`)
      .send(sendDataUpdate)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // Delete
    await request(API_ENDPOINT)
      .delete(`/employee/${employeeId}/employee-identifier/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/${employeeId}/employee-identifier/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });
});
