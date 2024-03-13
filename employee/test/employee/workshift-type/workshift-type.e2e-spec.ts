import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';

describe('WorktypeTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test crud worktype', async () => {
    const response = await request(API_ENDPOINT)
      .get('/employee/workshift-type')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toEqual(2);
      })
      .expect(HttpStatus.OK);

    const worktypeId = response.body.data[0].id;

    // test get by id
    const resultGetOne = await request(API_ENDPOINT)
      .get(`/employee/workshift-type/${worktypeId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(worktypeId);
      })
      .expect(HttpStatus.OK);

    // test update
    const oldWorkingDayQty = resultGetOne.body.data.workingDayQty;
    await request(API_ENDPOINT)
      .patch(`/employee/workshift-type/${worktypeId}`)
      .send({
        workingDayQty: 10
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);

    // get after update
    await request(API_ENDPOINT)
      .get(`/employee/workshift-type/${worktypeId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.workingDayQty).toEqual(10);
      })
      .expect(HttpStatus.OK);

    // update to orignal value
    await request(API_ENDPOINT)
      .patch(`/employee/workshift-type/${worktypeId}`)
      .send({
        workingDayQty: oldWorkingDayQty
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);
  });
});
