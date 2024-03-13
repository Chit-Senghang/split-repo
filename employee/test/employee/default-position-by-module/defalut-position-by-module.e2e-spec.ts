import * as request from 'supertest';
import { HttpStatus, Logger } from '@nestjs/common';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_HOUR_MINUTE_FORMAT
} from '../../../apps/shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDate
} from '../../../apps/shared-resources/common/utils/date-utils';
import { StatusEnum } from '../../../apps/shared-resources/common/enums/status.enum';
import { ReasonTemplateTypeEnum } from '../../../apps/employee/src/reason-template/common/ts/enum/type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import {
  createCompanyStructureTree,
  findEmployeeById,
  getAccessToken,
  getPositionLevelByName,
  getRandomBaseCurrentDateFaker,
  getRandomDateFaker,
  getRandomString
} from '../../common/common.e2e.service';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';
import { CodeTypesEnum } from '../../../apps/employee/src/key-value/ts/enums/permission.enum';
import { PositionLevelTitleEnum } from './../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';

describe('Default position by module', () => {
  let accessToken: string;
  let employee: any;
  let reasonTemplate: any;
  let currentDate: string;
  let codeValueData: any;

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
  });

  it('Test default position by module', async () => {
    codeValueData = await request(API_ENDPOINT)
      .get(`/employee/code-value?code=${CodeTypesEnum.WARNING_TYPE}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).not.toBeNull();
      })
      .expect(HttpStatus.OK);
    const warningTypeId = codeValueData.body.data[0].id;

    // Get reason template
    const reasonTemplates = await request(API_ENDPOINT)
      .get('/employee/reason-template')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).not.toBeNull();
      })
      .expect(HttpStatus.OK);
    reasonTemplate = reasonTemplates.body.data.find(
      (reasonTemplate: { type: string }) =>
        reasonTemplate.type === ReasonTemplateTypeEnum.OTHER
    );

    // Create warning
    const empWarning = {
      reason: getRandomString(),
      reasonTemplateId: reasonTemplate.id,
      warningTypeId: warningTypeId,
      warningDate: getRandomDateFaker(),
      employeeId: employee.id,
      warningTitle: getRandomString(),
      documentIds: []
    };
    await request(API_ENDPOINT)
      .post('/employee/employee-warning')
      .send(empWarning)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    //* Module Warning
    await request(API_ENDPOINT)
      .get('/employee/employee-warning')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        Logger.log('Employee Warning', res.body);
        expect(res.body.data.length).toBeGreaterThan(0);
        const employeeWarnings = res.body.data.filter(
          (employeeWarning: { employee: { isDefaultPosition: boolean } }) => {
            return employeeWarning.employee.isDefaultPosition === true;
          }
        );
        expect(res.body.data.length).toEqual(employeeWarnings.length);
      })
      .expect(HttpStatus.OK);

    // Create one
    const missedScan = {
      employeeId: employee.id,
      requestDate: getRandomBaseCurrentDateFaker(true),
      scanTime: dayJs(getRandomBaseCurrentDateFaker(true)).format(
        DEFAULT_HOUR_MINUTE_FORMAT
      ),
      status: StatusEnum.ACTIVE,
      reason: getRandomString(),
      reasonTemplateId: reasonTemplate.id,
      documentIds: []
    };

    await request(API_ENDPOINT)
      .post('/employee/missed-scan-request')
      .send(missedScan)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    // Missed Scan Request
    await request(API_ENDPOINT)
      .get('/employee/missed-scan-request')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        Logger.log('Missed Scan Request', res.body);
        expect(res.body.data.length).toBeGreaterThan(0);
        const missScanRequests = res.body.data.filter(
          (missScanRequest: { employee: { isDefaultPosition: boolean } }) => {
            return missScanRequest.employee.isDefaultPosition === true;
          }
        );
        expect(res.body.data.length).toEqual(missScanRequests.length);
      })
      .expect(HttpStatus.OK);

    //  Missed Overtime Request
    await request(API_ENDPOINT)
      .get('/employee/overtime-request')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        if (res.body.data.length) {
          Logger.log('Overtime Request', res.body);
          expect(res.body.data.length).toBeGreaterThan(0);
          const overtimeRequests = res.body.data.filter((overtimeRequest) => {
            return overtimeRequest.employee.isDefaultPosition === true;
          });
          expect(res.body.data.length).toEqual(overtimeRequests.length);
        }
      })
      .expect(HttpStatus.OK);

    // Create one
    currentDate = getCurrentDate().add(1, 'day').format(DEFAULT_DATE_FORMAT);
    const mission = {
      employeeId: employee.id,
      durationType: 'TIME',
      fromDate: `${currentDate} 08:00`,
      toDate: `${currentDate} 17:00`,
      reasonTemplateId: reasonTemplate.id,
      reason: getRandomString(),
      documentIds: []
    };
    await request(API_ENDPOINT)
      .post('/employee/mission-request')
      .send(mission)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    //  Mission Request
    await request(API_ENDPOINT)
      .get('/employee/mission-request')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        Logger.log('Mission Request', res.body);
        expect(res.body.data.length).toBeGreaterThan(0);
        const missionRequests = res.body.data.filter(
          (missionRequest: { employee: { isDefaultPosition: boolean } }) => {
            return missionRequest.employee.isDefaultPosition === true;
          }
        );
        expect(res.body.data.length).toEqual(missionRequests.length);
      })
      .expect(HttpStatus.OK);

    // Create one
    currentDate = getCurrentDate().add(2, 'day').format(DEFAULT_DATE_FORMAT);
    const dayOff = {
      employeeId: employee.id,
      dayOffDate: [currentDate]
    };
    await request(API_ENDPOINT)
      .post('/employee/day-off-request')
      .send(dayOff)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    // DayOff Request
    await request(API_ENDPOINT)
      .get('/employee/day-off-request')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        Logger.log('DayOff Request', res.body);
        expect(res.body.data.length).toBeGreaterThan(0);
        const dayOffs = res.body.data.filter(
          (dayOff: { employee: { isDefaultPosition: boolean } }) => {
            return dayOff.employee.isDefaultPosition === true;
          }
        );
        expect(res.body.data.length).toEqual(dayOffs.length);
      })
      .expect(HttpStatus.OK);

    // Leave Request
    await request(API_ENDPOINT)
      .get('/employee/leave-request')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        Logger.error('Leave Request', res.body.data.length);
        expect(res.body.data.length).toBeGreaterThan(0);
        const leaveRequests = res.body.data.filter(
          (leaveRequest: { employee: { isDefaultPosition: boolean } }) => {
            return leaveRequest.employee.isDefaultPosition === true;
          }
        );
        expect(res.body.data.length).toEqual(leaveRequests.length);
      })
      .expect(HttpStatus.OK);

    // Employee Master
    await request(API_ENDPOINT)
      .get('/employee/employee-master-information')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        Logger.log('Employee Master Information', res.body);
        expect(res.body.data.length).toBeGreaterThan(0);
        const employees = res.body.data.map((employee: { positions: any }) =>
          employee.positions.filter(
            (position: { isDefaultPosition: boolean }) => {
              return position.isDefaultPosition === true;
            }
          )
        );
        expect(res.body.data.length).toEqual(employees.length);
      })
      .expect(HttpStatus.OK);

    // Get employee resign type and create one
    codeValueData = await request(API_ENDPOINT)
      .get(`/employee/code-value?code=${CodeTypesEnum.RESIGNATION_TYPE}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).not.toBeNull();
      })
      .expect(HttpStatus.OK);
    const employeeResignTypeId = codeValueData.body.data[0].id;
    currentDate = getCurrentDate().add(1, 'month').format(DEFAULT_DATE_FORMAT);
    const empResign = {
      resignDate: currentDate,
      resignTypeId: employeeResignTypeId,
      reason: getRandomString(),
      reasonTemplateId: reasonTemplate.id,
      documentIds: []
    };
    await request(API_ENDPOINT)
      .post(`/employee/employee-resignation/employee/${employee.id}`)
      .send(empResign)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);

    // Module Resignation
    await request(API_ENDPOINT)
      .get('/employee/employee-resignation')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
        const employeeResignations = res.body.data.filter(
          (employeeResignation: {
            employee: { isDefaultPosition: boolean };
          }) => {
            return employeeResignation.employee.isDefaultPosition === true;
          }
        );
        expect(res.body.data.length).toEqual(employeeResignations.length);
      })
      .expect(HttpStatus.OK);
  });
});
