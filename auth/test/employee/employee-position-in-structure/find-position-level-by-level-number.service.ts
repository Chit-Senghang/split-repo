import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { CompanyStructureTypeEnum } from './../../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from './../../environment';
import { findTeamOrPositionByParentId } from './find-position-in-workflow.service';

const findPositionLevelByLevelNumber = async (
  accessToken: string,
  levelNumber: number
) => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/position-level?levelNumber=${levelNumber}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    })
    .expect(HttpStatus.OK);

  return response.body.data[0].id;
};

const findDepartmentAndTeamByDepartmentName = async (
  accessToken: string,
  departmetName: string,
  teamName: string
) => {
  const response = await request(API_ENDPOINT)
    .get(
      `/employee/company-structure?type=${CompanyStructureTypeEnum.DEPARTMENT}`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(1);
    })
    .expect(HttpStatus.OK);

  const departments: any = response.body.data;

  if (departments.length) {
    for (const department of departments) {
      if (department.companyStructureComponent.name === departmetName) {
        const teams = await findTeamOrPositionByParentId(
          accessToken,
          department.id
        );

        if (teams.length) {
          for (const team of teams) {
            if (team.name === teamName) {
              return { departmentId: department.id, teamId: team.id };
            }
          }
        }
      }
    }
  }
};

export {
  findPositionLevelByLevelNumber,
  findDepartmentAndTeamByDepartmentName
};
