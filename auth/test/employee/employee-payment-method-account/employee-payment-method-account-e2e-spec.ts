import * as crypto from 'node:crypto';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import {
  createCompanyStructureTree,
  getAccessToken,
  getPositionLevelByName
} from '../../common/common.e2e.service';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';
import { PositionLevelTitleEnum } from './../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';

describe('EmployeePaymentMethodTest', () => {
  let accessToken: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test Employee Payment Method', async () => {
    const accountNumber = crypto.randomUUID();
    const getPaymentByCash = await request(API_ENDPOINT)
      .get('/employee/payment-method?keywords=CASH')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);
    const paymentMethodCash = getPaymentByCash.body.data.find(
      (paymentMethod: any) => (paymentMethod.name = 'CASH')
    );

    const dataCreate = {
      paymentMethodId: paymentMethodCash.id,
      accountNumber,
      isDefaultAccount: false
    };

    const officerPositionLevel = await getPositionLevelByName(
      PositionLevelTitleEnum.OFFICER,
      accessToken
    );
    const companyStructurePosition = await createCompanyStructureTree(
      officerPositionLevel.id,
      accessToken
    );

    const employeeId = await createEmployee(
      companyStructurePosition.id,
      accessToken
    );

    await request(API_ENDPOINT)
      .post(`/employee/${employeeId}/employee-payment-method-account`)
      .send(dataCreate)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        const errorResponse = JSON.parse(res.text);
        expect(errorResponse.errors[0].message).toEqual(
          `accountNumber is not required`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    // Create with cash
    const response = await request(API_ENDPOINT)
      .post(`/employee/${employeeId}/employee-payment-method-account`)
      .send({
        paymentMethodId: paymentMethodCash.id,
        isDefaultAccount: false
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = response.body.data.id;

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/${employeeId}/employee-payment-method-account/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          id,
          accountNumber: null,
          isDefaultAccount: dataCreate.isDefaultAccount,
          paymentMethod: {
            id: paymentMethodCash.id,
            name: 'CASH'
          },
          employee: {
            id: employeeId
          }
        });
      })
      .expect(HttpStatus.OK);

    // Update
    await request(API_ENDPOINT)
      .patch(`/employee/${employeeId}/employee-payment-method-account/${id}`)
      .send(dataCreate)
      .set(AUTHORIZATION_KEY, accessToken)

      .expect((res) => {
        const errorResponse = JSON.parse(res.text);
        expect(errorResponse.errors[0].message).toEqual(
          `accountNumber is not required`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);
    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/${employeeId}/employee-payment-method-account/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/${employeeId}/employee-payment-method-account`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);
  });
});
