import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { CompanyStructureTypeEnum } from './../../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from './../../environment';

const findPositionInOutlet = async (
  params: IFindCompanyStructure
): Promise<number> => {
  const accessToken: string = params.accessToken;
  const response: request.Response = await request(API_ENDPOINT)
    .get('/employee/company-structure?type=OUTLET')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(1);
    })
    .expect(HttpStatus.OK);

  const outlets: any = response.body.data;

  const outlet = outlets.find(
    (outlet: any) => outlet.companyStructureComponent.name === params.outletName
  );

  const departments = await findChildByParentId(
    accessToken,
    outlet.id,
    CompanyStructureTypeEnum.DEPARTMENT
  );

  const department = departments.find(
    (department: any) =>
      department.companyStructureComponent.name === params.departmentName
  );

  const teams = await findTeamOrPositionByParentId(accessToken, department.id);

  const team = teams.find((team: any) => team.name === params.teamName);

  const positions = await findTeamOrPositionByParentId(accessToken, team.id);

  const position = positions.find(
    (position: any) => position.name === params.positionName
  );

  return position.id;
};

const findChildByParentId = async (
  accessToken: string,
  id: number,
  type: CompanyStructureTypeEnum
) => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/company-structure?type=${type}&parentId=${id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(1);
    })
    .expect(HttpStatus.OK);
  return response.body.data;
};

const findTeamOrPositionByParentId = async (
  accessToken: string,
  id: number
) => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/company-structure/department-or-team/${id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data).not.toBeNull();
    })
    .expect(HttpStatus.OK);
  return response.body.data;
};

interface IFindCompanyStructure {
  accessToken: string;
  outletName: string;
  departmentName: string;
  teamName: string;
  positionName: string;
}

export { findPositionInOutlet, findTeamOrPositionByParentId };
