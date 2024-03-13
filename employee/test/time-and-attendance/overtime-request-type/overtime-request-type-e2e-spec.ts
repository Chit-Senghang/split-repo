import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';

describe('OvertimeRequestTypeTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test get overtime request type', async () => {
    const response = await request(API_ENDPOINT)
      .get('/employee/overtime-request-type?limit=10')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toEqual(4);
      })
      .expect(HttpStatus.OK);

    const id = response.body.data[0].id;

    // get by id
    await request(API_ENDPOINT)
      .get(`/employee/overtime-request-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.name).not.toBeNull();
        expect(res.body.data.percentagePerHour).not.toBeNull();
      })
      .expect(HttpStatus.OK);

    // patch
    await request(API_ENDPOINT)
      .patch(`/employee/overtime-request-type/${id}`)
      .send({
        percentagePerHour: 201
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.OK);

    // get by id
    await request(API_ENDPOINT)
      .get(`/employee/overtime-request-type/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.percentagePerHour).toEqual('201');
      })
      .expect(HttpStatus.OK);

    // patch with invalid string
    await request(API_ENDPOINT)
      .patch(`/employee/overtime-request-type/${id}`)
      .send({
        percentagePerHour: '200ok'
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        const errorResponse = JSON.parse(res.text);
        expect(errorResponse.errors[0].message).toEqual(
          `percentagePerHour must be a number conforming to the specified constraints`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);
  });
});
