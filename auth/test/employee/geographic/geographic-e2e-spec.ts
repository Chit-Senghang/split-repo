import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';

describe('GeographicTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test get geographic', async () => {
    await request(API_ENDPOINT)
      .get('/employee/geographic?limit=10')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data?.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // get by province
    await request(API_ENDPOINT)
      .get('/employee/geographic?geographicType=PROVINCE&limit=10')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);
  });
});
