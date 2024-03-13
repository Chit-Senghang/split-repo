import { v4 as uuidv4 } from 'uuid';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { getAccessToken } from '../../common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';

describe('PositionLevelTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  let counter = 0;

  it('Test create position level', async () => {
    let levelTitle = uuidv4();
    const timestamp = Date.now();
    let levelNumber = timestamp * 1000 + (counter++ % 1000);

    const response = await request(API_ENDPOINT)
      .post('/employee/position-level')
      .send({ levelTitle, levelNumber })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // duplicate create
    await request(API_ENDPOINT)
      .post('/employee/position-level')
      .send({ levelTitle, levelNumber })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);

    const id = response.body.data.id;

    await request(API_ENDPOINT)
      .get(`/employee/position-level/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          levelTitle,
          levelNumber: `${levelNumber}`
        });
      })
      .expect(HttpStatus.OK);

    // update
    levelTitle = uuidv4();
    levelNumber = timestamp * 1000 + (counter++ % 1000);
    await request(API_ENDPOINT)
      .patch(`/employee/position-level/${id}`)
      .send({ levelTitle, levelNumber })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/position-level?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/position-level/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/position-level/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });
});
