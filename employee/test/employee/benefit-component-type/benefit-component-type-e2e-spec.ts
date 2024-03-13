import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { getAccessToken } from '../../common/common.e2e.service';
import { AUTHORIZATION_KEY, API_ENDPOINT } from '../../environment';

describe('BenefitComponentTypeTest', () => {
  let accessToken: string;
  let name = uuidv4();

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test create benefit-component-type', async () => {
    // name is required
    name = null;
    await request(API_ENDPOINT)
      .post('/employee/benefit-component-type')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST);

    // create benefit-component-type
    name = uuidv4();
    const res = await request(API_ENDPOINT)
      .post('/employee/benefit-component-type')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // create duplicate name
    await request(API_ENDPOINT)
      .post('/employee/benefit-component-type')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CONFLICT);

    const id = res.body.data.id;
    // get one
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component-type?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // update
    await request(API_ENDPOINT)
      .patch(`/employee/benefit-component-type/${id}`)
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/benefit-component-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });
});
