import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import {
  getAccessToken,
  getRandomBaseCurrentDateFaker
} from '../../common/common.e2e.service';

describe('PublicHolidayTest', () => {
  let accessToken: string;
  const randomDate: string = getRandomBaseCurrentDateFaker();

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await request(API_ENDPOINT)
      .get(`/employee/public-holiday`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);
  });

  it('Test create public-holiday', async () => {
    let name = uuidv4();
    const response = await request(API_ENDPOINT)
      .post('/employee/public-holiday')
      .send({ name, date: randomDate })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = response.body.data.id;

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/public-holiday/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          name,
          date: randomDate
        });
      })
      .expect(HttpStatus.OK);

    // create duplicate date
    name = uuidv4();
    await request(API_ENDPOINT)
      .post('/employee/public-holiday')
      .send({ name, date: randomDate })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);

    // update
    name = uuidv4();
    await request(API_ENDPOINT)
      .patch(`/employee/public-holiday/${id}`)
      .send({ name, date: randomDate })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // create one
    name = uuidv4();
    await request(API_ENDPOINT)
      .post('/employee/public-holiday')
      .send({ name, date: getRandomBaseCurrentDateFaker() })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    // get all after create
    await request(API_ENDPOINT)
      .get(`/employee/public-holiday?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThanOrEqual(0);
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/public-holiday/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/public-holiday/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Test Public Holiday With Bonus Percentage', async () => {
    const name = uuidv4();
    const randomDate: string = getRandomBaseCurrentDateFaker();
    let bonusPercentage = 1.25;
    // create one
    const res = await request(API_ENDPOINT)
      .post('/employee/public-holiday')
      .send({ name, date: randomDate, bonusPercentage })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    const id = res.body.data.id;

    // get one after create
    await request(API_ENDPOINT)
      .get(`/employee/public-holiday/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        const itemWithBonus: boolean =
          Number(res.body.data.bonusPercentage) === bonusPercentage;
        expect(itemWithBonus).toBeTruthy();
      });

    // update one
    bonusPercentage = 2.25;
    await request(API_ENDPOINT)
      .patch(`/employee/public-holiday/${id}`)
      .send({ bonusPercentage })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one after update
    await request(API_ENDPOINT)
      .get(`/employee/public-holiday/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        const itemWithBonus: boolean =
          Number(res.body.data.bonusPercentage) === bonusPercentage;
        expect(itemWithBonus).toBeTruthy();
      });

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/public-holiday/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('bonusPercentage');
      });
  });
});
