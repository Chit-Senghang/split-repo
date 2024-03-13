import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { StatusEnum } from '../../../apps/shared-resources/common/enums/status.enum';

export type RequestWorkflowPayload = {
  enable: boolean;
  description: string;
  requesters: workflowPosition[];
  requestFors?: workflowPosition[];
  firstApprovers: workflowPosition[];
  secondApprovers?: workflowPosition[];
  acknowledgers?: workflowPosition[];
};

export type workflowPosition = {
  positionLevelId: number;
  companyStructureDepartmentId?: number;
  companyStructureTeamId?: number;
};

const createRequestApprovalWorkflowByType = async (
  workflowTypeId: number,
  accessToken: string,
  requestWorkflowPositionLevel: RequestWorkflowPayload
) => {
  const requestApprovalWorkflow = await request(API_ENDPOINT)
    .post(`/employee/request-workflow-type/${workflowTypeId}/workflow`)
    .send(requestWorkflowPositionLevel)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
  return requestApprovalWorkflow.body.data;
};

const getWorkflowTypeByName = async (
  name: MediaEntityTypeEnum,
  accessToken: string
) => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/request-workflow-type?name=${name}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(0);
    })
    .expect(HttpStatus.OK);
  return response.body.data.find(
    (workflowType: any) => workflowType.name === name
  );
};

const deleteWorkflowByWorkflowTypeName = async (
  name: MediaEntityTypeEnum,
  accessToken: string
): Promise<boolean> => {
  let isDeleted = true;
  const workflowType = await getWorkflowTypeByName(name, accessToken);
  if (workflowType.requestApprovalWorkflow.length) {
    await Promise.all(
      workflowType.requestApprovalWorkflow.map(async (item: any) => {
        const activeApprovalStatus = await getApprovalStatus(
          accessToken,
          workflowType.id,
          StatusEnum.ACTIVE
        );
        if (activeApprovalStatus.length) {
          isDeleted = false;
          return;
        }
        const pendingApprovalStatus = await getApprovalStatus(
          accessToken,
          workflowType.id,
          StatusEnum.PENDING
        );

        if (pendingApprovalStatus.length) {
          isDeleted = false;
          return;
        }

        await request(API_ENDPOINT)
          .delete(`/employee/request-workflow-type/workflow/${item.id}`)
          .set(AUTHORIZATION_KEY, accessToken)
          .expect(HttpStatus.NO_CONTENT);
      })
    );
    return isDeleted;
  }
  return false;
};

const getApprovalStatus = async (
  accessToken: string,
  workflowTypeId: number,
  status: StatusEnum
) => {
  const approvalStatus = await request(API_ENDPOINT)
    .get(
      `/employee/approval-status-tracking?status=${status}&requestWorkflowTypeId=${workflowTypeId}`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK);

  return approvalStatus.body.data;
};

export {
  getWorkflowTypeByName,
  createRequestApprovalWorkflowByType,
  deleteWorkflowByWorkflowTypeName
};
