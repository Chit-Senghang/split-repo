import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { EmployeePosition } from '../../../apps/employee/src/employee-position/entities/employee-position.entity';
import {
  createCompanyStructureTree,
  getAccessToken,
  getPositionLevelByName
} from '../../../test/common/common.e2e.service';
import { PositionLevelTitleEnum } from '../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';

describe('Test Employee Position', () => {
  let accessToken: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Create New Structure And Test Mpath', async () => {
    const internPositionLevelInfo = await getPositionLevelByName(
      PositionLevelTitleEnum.INTERN,
      accessToken
    );
    const companyStructurePosition = await createCompanyStructureTree(
      internPositionLevelInfo.id,
      accessToken,
      true
    );

    const mpath: string = companyStructurePosition.mpath;

    const employeeId: number = await createEmployee(
      companyStructurePosition.id,
      accessToken
    );

    //CASE: get one record after create employee and expect default position and mpath
    await getEmployeePositionById(employeeId, accessToken, mpath);
  });
});

const getEmployeePositionById = async (
  employeeId: number,
  accessToken: string,
  mpath: string
): Promise<EmployeePosition> => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/employee-by-position/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toEqual(employeeId);
      if (mpath) {
        expect(res.body.data.positions.at(0).mpath).toEqual(mpath);
        expect(res.body.data.positions.length).toEqual(1);
        expect(res.body.data.positions.at(0).isDefaultPosition).toEqual(true);
      }
    });

  return response.body.data;
};
