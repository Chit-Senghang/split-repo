import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';
import { iBankingReportFormatEnum } from '../../../apps/employee/src/payment-method/enum/ibanking-report-format.enum';

describe('PaymentMethodTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test create payment method', async () => {
    const temp = {
      name: uuidv4(),
      isSystemDefined: true
    };
    const response = await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send(temp)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // create duplicate
    await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send(temp)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);

    const id = response.body.data.id;

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/payment-method/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ name: temp.name });
      })
      .expect(HttpStatus.OK);

    await request(API_ENDPOINT)
      .get(`/employee/payment-method?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/payment-method/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ name: temp.name });
      })
      .expect(HttpStatus.OK);

    // delete when isSystemDefined = true
    await request(API_ENDPOINT)
      .delete(`/employee/payment-method/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to make any changes due to system defined`
        );
      })
      .expect(HttpStatus.FORBIDDEN);

    // IsSystemDefined = false
    const data = {
      name: uuidv4(),
      isSystemDefined: false
    };

    const response2 = await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send(data)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const idRes2 = response2.body.data.id;

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/payment-method/${idRes2}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ name: data.name });
      })
      .expect(HttpStatus.OK);

    // update
    const nameUpdate = uuidv4();
    await request(API_ENDPOINT)
      .patch(`/employee/payment-method/${idRes2}`)
      .send({ name: nameUpdate, isSystemDefined: false })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(idRes2);
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/payment-method/${idRes2}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/payment-method/${idRes2}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);

    await request(API_ENDPOINT)
      .get(`/employee/payment-method/ibanking-report-format/list`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toEqual(Object.values(iBankingReportFormatEnum));
      })
      .expect(HttpStatus.OK);
  });

  it('Test create payment method with Ibanking report format', async () => {
    const temp = {
      name: uuidv4(),
      iBankingReportFormat: iBankingReportFormatEnum.ABA_IBANKING
    };

    await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send({ name: temp.name, iBankingReportFormat: 'Acleda' })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `iBankingReportFormat must be one of the following values: ABA_IBANKING`
        );
      });

    const response = await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send(temp)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = response.body.data.id;

    await request(API_ENDPOINT)
      .get('/employee/payment-method/' + id)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.iBankingReportFormat).toEqual(
          iBankingReportFormatEnum.ABA_IBANKING
        );
      })
      .expect(HttpStatus.OK);

    await request(API_ENDPOINT)
      .patch('/employee/payment-method/' + id)
      .send({ name: uuidv4(), iBankingReportFormat: 'Acleda' })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `iBankingReportFormat must be one of the following values: ABA_IBANKING`
        );
      });

    await request(API_ENDPOINT)
      .patch('/employee/payment-method/' + id)
      .send({
        name: uuidv4(),
        iBankingReportFormat: iBankingReportFormatEnum.ABA_IBANKING
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.OK);
  });
});
