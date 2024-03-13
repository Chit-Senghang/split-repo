import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';
import { dayJs } from './../../../apps/shared-resources/common/utils/date-utils';
import { DEFAULT_DATE_TIME_FORMAT } from './../../../apps/shared-resources/common/dto/default-date-format';

describe('Payment method Test', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test create payment method', async () => {
    let name = uuidv4();
    const response = await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // create duplicate
    await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send({ name })
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
        expect(res.body.data).toMatchObject({ name });
      })
      .expect(HttpStatus.OK);

    // update
    name = uuidv4();
    await request(API_ENDPOINT)
      .patch(`/employee/payment-method/${id}`)
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/payment-method/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ name });
      })
      .expect(HttpStatus.OK);

    // date time format
    await request(API_ENDPOINT)
      .get(`/employee/payment-method/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        const formattedCreatedAt = dayJs(res.body.data.createdAt).format(
          DEFAULT_DATE_TIME_FORMAT
        );
        expect(res.body.data.createdAt).toMatch(formattedCreatedAt);

        const formattedUpdatedAt = dayJs(res.body.data.updatedAt).format(
          DEFAULT_DATE_TIME_FORMAT
        );

        expect(res.body.data.createdAt).toMatch(formattedUpdatedAt);
      })
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/payment-method?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/payment-method/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/payment-method/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });
});
