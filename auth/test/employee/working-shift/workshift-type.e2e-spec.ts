import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { WorkShiftTypeEnum } from '../../../apps/employee/src/workshift-type/common/ts/enum/workshift-type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';
import { getWorkshiftTypeByName } from '../workshift-type/workshift-type.e2e-service';

describe('WorktypeTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test crud working shift with NORMAL X2', async () => {
    // create
    const normalWorkshiftType = await getWorkshiftTypeByName(
      accessToken,
      WorkShiftTypeEnum.NORMAL
    );
    let name = `Normal x2 08-17 ${uuidv4()}`;
    const payload = {
      name,
      workshiftTypeId: normalWorkshiftType.id,
      startWorkingTime: '08:00',
      endWorkingTime: '17:00',
      startScanTimePartOne: '08:00',
      endScanTimePartOne: '17:00',
      scanType: 'TWO_TIMES',
      breakTime: 60,
      workOnWeekend: true,
      weekendScanTime: '12:00'
    };

    const createResponse = await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    // get by id
    const id = createResponse.body.data.id;
    await request(API_ENDPOINT)
      .get(`/employee/working-shift/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(JSON.parse(res.text).data).toMatchObject({
          id,
          name,
          startWorkingTime: '08:00:00',
          endWorkingTime: '17:00:00',
          startScanTimePartOne: '08:00:00',
          endScanTimePartOne: '17:00:00',
          breakTime: 60,
          workOnWeekend: true,
          weekendScanTime: '12:00:00',
          // workingHour: 111, Fix me
          workshiftType: {
            id: 1,
            name: 'NORMAL'
          },
          scanType: 'TWO_TIMES'
        });
      })
      .expect(HttpStatus.OK);

    // update
    name = `Normal x2 08-17 ${uuidv4()}`;
    const payloadUpdate = {
      name,
      workshiftTypeId: normalWorkshiftType.id,
      startWorkingTime: '09:00',
      endWorkingTime: '18:00',
      startScanTimePartOne: '09:00',
      endScanTimePartOne: '18:00',
      scanType: 'TWO_TIMES',
      breakTime: 30,
      workOnWeekend: true,
      weekendScanTime: '11:00'
    };

    await request(API_ENDPOINT)
      .patch(`/employee/working-shift/${id}`)
      .send(payloadUpdate)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);

    // get by id
    await request(API_ENDPOINT)
      .get(`/employee/working-shift/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(JSON.parse(res.text).data).toMatchObject({
          id,
          name,
          startWorkingTime: '09:00:00',
          endWorkingTime: '18:00:00',
          startScanTimePartOne: '09:00:00',
          endScanTimePartOne: '18:00:00',
          breakTime: 30,
          workOnWeekend: true,
          weekendScanTime: '11:00:00',
          workingHour: 510,
          workshiftType: {
            name: 'NORMAL'
          },
          scanType: 'TWO_TIMES'
        });
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/working-shift/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get after delete
    await request(API_ENDPOINT)
      .get(`/employee/working-shift/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Test crud working shift with ROSTER X4', async () => {
    // create
    const rosterWorkshiftType = await getWorkshiftTypeByName(
      accessToken,
      WorkShiftTypeEnum.ROSTER
    );
    const name = `Roster x4 08-17 ${uuidv4()}`;
    const payload = {
      name,
      workshiftTypeId: rosterWorkshiftType.id,
      startWorkingTime: '08:00',
      endWorkingTime: '17:00',
      startScanTimePartOne: '08:00',
      endScanTimePartOne: '17:00',
      scanType: 'FOUR_TIMES',
      breakTime: 90
    };

    const createResponse = await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    // get by id
    const id = createResponse.body.data.id;
    await request(API_ENDPOINT)
      .get(`/employee/working-shift/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(JSON.parse(res.text).data).toMatchObject({
          id,
          name,
          startWorkingTime: '08:00:00',
          endWorkingTime: '17:00:00',
          startScanTimePartOne: '08:00:00',
          endScanTimePartOne: '17:00:00',
          breakTime: 90,
          workingHour: 450,
          workshiftType: {
            name: 'ROSTER'
          },
          scanType: 'FOUR_TIMES'
        });
      })
      .expect(HttpStatus.OK);
  });
});
