import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { DEFAULT_DATE_FORMAT } from '../../../apps/shared-resources/common/dto/default-date-format';
import { getCurrentDate } from '../../../apps/shared-resources/common/utils/date-utils';
import { PositionLevelTitleEnum } from '../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import {
  createCompanyStructureTree,
  findEmployeeById,
  getAccessToken,
  getPositionLevelByName,
  getRandomString,
  getReasonTemplateTypeOTHER
} from '../../common/common.e2e.service';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';

describe('Mission Request', () => {
  let accessToken: string;
  let currentDate: string;
  let employee: any;
  let reasonTemplate: any;
  let missionRequest: any;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    const officerPositionLevelInfo = await getPositionLevelByName(
      PositionLevelTitleEnum.OFFICER,
      accessToken
    );

    // create officer employee and requestFor user
    const officerPositionCompanyStructureId = await createCompanyStructureTree(
      officerPositionLevelInfo.id,
      accessToken,
      false,
      PositionLevelTitleEnum.OFFICER
    );
    const officerEmployeeId: number = await createEmployee(
      officerPositionCompanyStructureId['id'],
      accessToken
    );
    employee = await findEmployeeById(officerEmployeeId, accessToken);
    expect(employee.positions[0].isDefaultPosition).toEqual(true);
    reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);
  });

  it('Test create mission request duplicate date', async () => {
    currentDate = getCurrentDate().add(1, 'day').format(DEFAULT_DATE_FORMAT);
    missionRequest = {
      employeeId: employee.id,
      durationType: 'TIME',
      fromDate: `${currentDate} 08:00`,
      toDate: `${currentDate} 17:00`,
      reasonTemplateId: reasonTemplate.id,
      reason: getRandomString()
    };
    await request(API_ENDPOINT)
      .post('/employee/mission-request')
      .send(missionRequest)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    await request(API_ENDPOINT)
      .post('/employee/mission-request')
      .send(missionRequest)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatusCode.Conflict)
      .expect((res) => {
        expect(res.body.errors.at(0).message).toEqual(
          'The request dates already exist.'
        );
      });
  });

  it('Test create mission request fromDate should be smaller than the toDate', async () => {
    currentDate = getCurrentDate().format(DEFAULT_DATE_FORMAT);
    missionRequest = {
      employeeId: employee.id,
      durationType: 'TIME',
      fromDate: `${currentDate} 08:00`,
      toDate: `${currentDate} 07:00`,
      reasonTemplateId: reasonTemplate.id,
      reason: getRandomString()
    };
    await request(API_ENDPOINT)
      .post('/employee/mission-request')
      .send(missionRequest)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatusCode.BadRequest)
      .expect((res) => {
        expect(res.body.errors.at(0).message).toEqual(
          'The start time must be smaller than the end time'
        );
      });
  });

  it('Test create mission request fromDate should be the same as the toDate"', async () => {
    const froDate: string = getCurrentDate().format(DEFAULT_DATE_FORMAT);
    const toDate: string = getCurrentDate()
      .add(1, 'day')

      .format(DEFAULT_DATE_FORMAT);
    missionRequest = {
      employeeId: employee.id,
      durationType: 'TIME',
      fromDate: `${froDate} 08:00`,
      toDate: `${toDate} 07:00`,
      reasonTemplateId: reasonTemplate.id,
      reason: getRandomString()
    };
    await request(API_ENDPOINT)
      .post('/employee/mission-request')
      .send(missionRequest)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatusCode.BadRequest)
      .expect((res) => {
        expect(res.body.errors.at(0).message).toEqual(
          'The start date must be the same as the end date'
        );
      });
  });

  it('Test get mission request all and one', async () => {
    const response = await request(API_ENDPOINT)
      .get('/employee/mission-request?limit=1')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatusCode.Ok)
      .expect((res: any) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      });
    const missionRequestId = response.body.data.at(0).id;
    await request(API_ENDPOINT)
      .get(`/employee/mission-request/${missionRequestId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatusCode.Ok);
  });
});
