import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { getAccessToken } from '../../common/common.e2e.service';
import { AUTHORIZATION_KEY, API_ENDPOINT } from '../../environment';

describe('DeductionTypeTest', () => {
  let accessToken: string;
  let name: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  // name is required
  it('name should be required', async () => {
    name = null;
    await request(API_ENDPOINT)
      .post('/employee/payroll-deduction-type')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('Test create deduction-type', async () => {
    // create
    name = uuidv4();
    const res = await request(API_ENDPOINT)
      .post('/employee/payroll-deduction-type')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // create duplicate
    await request(API_ENDPOINT)
      .post('/employee/payroll-deduction-type')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `${name} already exists`
        );
      })
      .expect(HttpStatus.CONFLICT);

    const id = res.body.data.id;
    // get one
    await request(API_ENDPOINT)
      .get(`/employee/payroll-deduction-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ name });
      })
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/payroll-deduction-type?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // update
    name = uuidv4();
    await request(API_ENDPOINT)
      .patch(`/employee/payroll-deduction-type/${id}`)
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one after update
    await request(API_ENDPOINT)
      .get(`/employee/payroll-deduction-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        expect(res.body.data).toMatchObject({
          name
        });
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/payroll-deduction-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/payroll-deduction-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });
});
