import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import {
  getAccessToken,
  getRandomDateFaker,
  getRandomEmailFaker,
  getRandomPasswordFaker,
  getRandomPhoneFaker,
  getRandomUsernameFaker
} from '../../common/common.e2e.service';
import {
  findDepartmentAndTeamByDepartmentName,
  findPositionLevelByLevelNumber
} from '../employee-position-in-structure/find-position-level-by-level-number.service';
import { EMPLOYEE_DATA } from '../employee-position-in-structure/employee-data.constant';
import { findPositionInOutlet } from '../employee-position-in-structure/find-position-in-workflow.service';
import { CodeTypesEnum } from '../../../apps/employee/src/key-value/ts/enums/permission.enum';
import { deleteWorkflowByWorkflowTypeName } from '../workflow/components-create-workflow.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from './../../environment';
import { createEmployee } from './../employee-position-in-structure/create-employee.service';

describe('TestWarningWorkflow', () => {
  let accessToken: string;
  let isDeleted: boolean;
  const randomPhone = getRandomPhoneFaker();
  const randomDate = getRandomDateFaker();
  const randomUsername = getRandomUsernameFaker();
  const randomEmail = getRandomEmailFaker();
  const randomPassword = getRandomPasswordFaker();
  beforeAll(async () => {
    accessToken = await getAccessToken();
    isDeleted = await deleteWorkflowByWorkflowTypeName(
      MediaEntityTypeEnum.WARNING,
      accessToken
    );
  });
  it('CreateWarningWorkflow', async () => {
    if (isDeleted) {
      const { departmentId, teamId } =
        await findDepartmentAndTeamByDepartmentName(
          accessToken,
          'Human Resource And Administration',
          'Compliance And Employee Relationship'
        );
      const workflowTypeData = await request(API_ENDPOINT)
        .get('/employee/request-workflow-type')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(1);
        })
        .expect(HttpStatus.OK);

      const workflowType = workflowTypeData.body.data.find(
        (item: any) => item.name === 'WARNING'
      );
      await request(API_ENDPOINT)
        .post(`/employee/request-workflow-type/${workflowType.id}/workflow`)
        .send({
          enable: true,
          description: 'For level 0-3',
          requesters: [
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                6
              )
            },
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                4.2
              )
            },
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                5
              )
            },
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                4.1
              )
            }
          ],
          requestFors: [
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                0
              )
            },
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                1
              )
            },
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                2.1
              )
            },
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                2.2
              )
            },
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                3
              )
            }
          ],
          firstApprovers: [
            {
              positionLevelId: await findPositionLevelByLevelNumber(
                accessToken,
                3
              ),
              companyStructureDepartmentId: departmentId,
              companyStructureTeamId: teamId
            }
          ],
          secondApprovers: [],
          acknowledgers: []
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).not.toBeNull();
        })
        .expect(HttpStatus.CREATED);
      if (EMPLOYEE_DATA.length) {
        //create employee in structure and attach user
        for (const index in EMPLOYEE_DATA) {
          const positionLevelId: number = await findPositionInOutlet({
            departmentName: EMPLOYEE_DATA[index].departmentName,
            teamName: EMPLOYEE_DATA[index].teamName,
            outletName: EMPLOYEE_DATA[index].outletName,
            positionName: EMPLOYEE_DATA[index].positionName,
            accessToken
          });
          const employeeId = await createEmployee(positionLevelId, accessToken);

          const response = await request(API_ENDPOINT)
            .post('/authentication/user')
            .send({
              username: randomUsername,
              isSelfService: true,
              email: randomEmail,
              password: randomPassword,
              phone: randomPhone,
              roles: [1]
            })
            .set(AUTHORIZATION_KEY, accessToken)
            .expect((res) => {
              expect(res.body.data.id).not.toBeNull();
            })
            .expect(HttpStatus.CREATED);

          const user = response.body.data;
          await request(API_ENDPOINT)
            .patch(`/employee/employee-master-information/${employeeId}/user`)
            .send({ userId: user.id })
            .set(AUTHORIZATION_KEY, accessToken)
            .expect((res) => {
              expect(res.body.data.id).not.toBeNull();
            })
            .expect(HttpStatus.OK);
        }
      }

      const employeeData = await request(API_ENDPOINT)
        .get('/employee/employee-master-information')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(1);
        })
        .expect(HttpStatus.OK);

      // find employee in the same team of reqeuster
      const employee = employeeData.body.data.find(
        (employee: any) =>
          employee.positions[0].companyStructurePosition.positionLevelId
            .levelNumber === '3' &&
          employee.positions[0].companyStructureTeam.companyStructureComponent
            .name === 'Administration'
      );
      const codeValueData = await request(API_ENDPOINT)
        .get(`/employee/code-value?code=${CodeTypesEnum.WARNING_TYPE}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).not.toBeNull();
        })
        .expect(HttpStatus.OK);
      const warningTypeId = codeValueData.body.data[0].id;

      //find reason template id of type OTHER
      const reasonTemplates = await request(API_ENDPOINT)
        .get('/employee/reason-template')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).not.toBeNull();
        })
        .expect(HttpStatus.OK);
      const reasonTemplateId = reasonTemplates.body.data.find(
        (reasonTemplate) => reasonTemplate.type === 'OTHER'
      );

      //create with employee who does not have the same level as workflow
      accessToken = await getAccessToken('compliance0@gmail.com', 'admin12345');
      await request(API_ENDPOINT)
        .post('/employee/employee-warning')
        .send({
          employeeId: employee.id,
          warningTypeId: warningTypeId,
          reason: 'Play game too much',
          warningDate: randomDate,
          reasonTemplateId: reasonTemplateId.id
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((err) => {
          const errorResponse = JSON.parse(err.text);
          expect(errorResponse.errors[0].message).toEqual(
            `Requester's position doesn't match with workflow`
          );
        })
        .expect(HttpStatus.NOT_FOUND);

      // create with employee having the same position level as workflow
      accessToken = await getAccessToken(
        'administration41@gmail.com',
        'admin12345'
      );
      const warningResponse = await request(API_ENDPOINT)
        .post('/employee/employee-warning')
        .send({
          employeeId: employee.id,
          warningTypeId,
          reason: 'Play game too much',
          warningDate: randomDate,
          reasonTemplateId
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).not.toBeNull();
        })
        .expect(HttpStatus.CREATED);

      const employeeWarningId = warningResponse.body.data.id;

      // check approval status
      accessToken = await getAccessToken('compliance3@gmail.com', 'admin12345');
      const response = await request(API_ENDPOINT)
        .get(
          `/employee/approval-status-tracking?requestWorkflowTypeId=${workflowType.id}&entityId=${employeeWarningId}`
        )
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
        })
        .expect(HttpStatus.OK);

      const approvalStatusId = response.body.data[0].id;

      // check notification
      await request(API_ENDPOINT)
        .get(`/employee/notification?approvalStatusId=${approvalStatusId}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
        })
        .expect(HttpStatus.OK);

      //approve with employee who doesn't match with workflow (approver is only with employee level 3)
      accessToken = await getAccessToken(
        'compliance41@gmail.com',
        'admin12345'
      );
      await request(API_ENDPOINT)
        .patch(`/employee/approval-status-tracking/${approvalStatusId}`)
        .send({
          reason: 'This should be allow because Thearith is so lazy',
          approvalResult: true
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((err) => {
          const errorResponse = JSON.parse(err.text);
          expect(errorResponse.errors[0].message).toEqual(
            `You are not allowed to update because your position level deosn't match with workflow`
          );
        })
        .expect(HttpStatus.FORBIDDEN);

      //check status when approved. Because it is only one approver, expectations it active
      accessToken = await getAccessToken('compliance3@gmail.com', 'admin12345');
      await request(API_ENDPOINT)
        .patch(`/employee/approval-status-tracking/${approvalStatusId}`)
        .send({
          reason: 'This should be allow because Thearith is so lazy',
          approvalResult: true
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).not.toBeNull();
        })
        .expect(HttpStatus.OK);

      await request(API_ENDPOINT)
        .get(`/employee/approval-status-tracking/${approvalStatusId}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.status).toEqual('ACTIVE');
        })
        .expect(HttpStatus.OK);

      //check employee warning recrod is active or not
      await request(API_ENDPOINT)
        .get(`/employee/employee-warning/${employeeWarningId}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.status).toEqual('ACTIVE');
        })
        .expect(HttpStatus.OK);
    }
  });
});
