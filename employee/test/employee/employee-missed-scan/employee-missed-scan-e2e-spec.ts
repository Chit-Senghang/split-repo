import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PositionLevelTitleEnum } from '../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import {
  createCompanyStructureTree,
  findApprovalStatusByEntityIdAndType,
  getAccessToken,
  getNotification,
  getPositionLevelByName,
  getRandomString,
  getReasonTemplateTypeOTHER,
  getRequestWorkflowTypeByName,
  updateApprovalStatus
} from '../../../test/common/common.e2e.service';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';
import { StatusEnum } from '../../../apps/shared-resources/common/enums/status.enum';
import { dayJs } from '../../../apps/shared-resources/common/utils/date-utils';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { employeeWorkflowOnSetService } from '../workflow/employee-workflow-one-set.service';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import { ActionTypeEnum } from '../../../apps/employee/src/approval-status-tracking/common/ts/enum/action-type.enum';
import { TypeEnum } from '../../../apps/employee/src/request-approval-workflow/common/ts/enum/type.enum';
import { WorkflowTypeEnum } from '../../../apps/shared-resources/common/enum/workflow-type.enum';
import { ApprovalStatusEnum } from '../../../apps/employee/src/approval-status-tracking/common/ts/enum/approval-status.enum';
import { DEFAULT_DATE_FORMAT } from '../../../apps/shared-resources/common/dto/default-date-format';

describe('EmployeeMissedScanTest', () => {
  let accessToken: string;
  let reason: string;
  const today = dayJs().format(DEFAULT_DATE_FORMAT);
  const tomorrow = dayJs().add(1, 'day').format(DEFAULT_DATE_FORMAT);
  const yesterday = dayJs().subtract(1, 'day').format(DEFAULT_DATE_FORMAT);
  beforeAll(async () => {
    accessToken = await getAccessToken();
    reason = getRandomString();
  });

  it('Employee Missed Scan with admin', async () => {
    //get officer position level
    const officerPositionLevelInfo = await getPositionLevelByName(
      PositionLevelTitleEnum.OFFICER,
      accessToken
    );
    //create officer level position
    const officerPositionCompanyStructureId = await createCompanyStructureTree(
      +officerPositionLevelInfo.id,
      accessToken,
      false,
      PositionLevelTitleEnum.OFFICER
    );
    //create employee officer level
    const officerEmployeeId: number = await createEmployee(
      +officerPositionCompanyStructureId['id'],
      accessToken
    );

    //CASE: create missed scan request case fail with future date
    const payload: IMissedScanDto = {
      employeeId: officerEmployeeId,
      reason: reason,
      reasonTemplateId: 1,
      requestDate: tomorrow,
      scanTime: '08:00',
      status: StatusEnum.PENDING,
      documentIds: []
    };
    await request(API_ENDPOINT)
      .post(`/employee/missed-scan-request`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `Request date must be before or same as current date.`
        );
      });

    //CASE: create missed scan request case success with back date
    payload.requestDate = yesterday;
    await createMissedScanRequest(accessToken, payload);

    //CASE: create missedScan request case success with current date
    payload.requestDate = today;
    const missedScanId = await createMissedScanRequest(accessToken, payload);

    //CASE: find one after create
    await findMissedScanById(accessToken, missedScanId);

    //CASE: update missedScan request case fail
    payload.reason = getRandomString();
    await request(API_ENDPOINT)
      .patch(`/employee/missed-scan-request/${missedScanId}`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You can not update this record, because the status is ACTIVE.`
        );
      });

    //CASE: delete missedScan request case fail
    await request(API_ENDPOINT)
      .delete(`/employee/missed-scan-request/${missedScanId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to delete this record because of status ACTIVE.`
        );
      });
  });

  it('Employee Missed Scan with workflow', async () => {
    const workflowOneSetInfo = await employeeWorkflowOnSetService(
      accessToken,
      false,
      false,
      MediaEntityTypeEnum.MISSED_SCAN
    );
    //officer
    const officerEmployeeId = workflowOneSetInfo.officerEmployee.id;
    const requestForUserId =
      workflowOneSetInfo.officerEmployee.LoginInfo.userId;
    const requestForAccessToken =
      workflowOneSetInfo.officerEmployee.AccessToken;
    //supervisor
    const requesterUserId =
      workflowOneSetInfo.supervisorEmployee.LoginInfo.userId;
    const requesterAccessToken =
      workflowOneSetInfo.supervisorEmployee.AccessToken;
    //manager
    const approverAccessToken = workflowOneSetInfo.managerEmployee.AccessToken;
    const approverUserId = workflowOneSetInfo.managerEmployee.LoginInfo.userId;
    //head of department
    const acknowledgerUserId = workflowOneSetInfo.headEmployee.LoginInfo.userId;
    const acknowledgerAccessToken = workflowOneSetInfo.headEmployee.AccessToken;

    //get reason template id type OTHER
    const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);

    //CASE: create missedScan request case success with current date
    const payload: IMissedScanDto = {
      employeeId: officerEmployeeId,
      reason: reason,
      reasonTemplateId: reasonTemplate.id,
      requestDate: today,
      scanTime: '08:00',
      status: StatusEnum.PENDING,
      documentIds: []
    };
    let missedScanId = await createMissedScanRequest(
      requesterAccessToken,
      payload
    );

    //CASE: find one after created
    await findMissedScanById(requesterAccessToken, missedScanId);

    //CASE: update missedScan request case status PENDING
    payload.reason = getRandomString();
    await request(API_ENDPOINT)
      .patch(`/employee/missed-scan-request/${missedScanId}`)
      .send(payload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK);

    //get approvalStatus
    let approvalStatus = await findApprovalStatusByEntityIdAndType(
      missedScanId,
      MediaEntityTypeEnum.MISSED_SCAN,
      approverAccessToken
    );

    //CASE: check if approver received notification after create missedScan request
    await getNotification(
      approverAccessToken,
      approverUserId,
      approvalStatus.id
    );

    //CASE: reject missedScan request case success
    const approvalStatusPayload = {
      approvalResult: false,
      reason: 'other'
    };
    await updateApprovalStatus(
      approverAccessToken,
      approvalStatus.id,
      approvalStatusPayload
    );

    //CASE: test check if approver and requester received notification after rejected
    await getNotification(
      requesterAccessToken,
      requesterUserId,
      approvalStatus.id
    );

    //CASE: delete missedScan request status REJECTED case fail
    await request(API_ENDPOINT)
      .delete(`/employee/missed-scan-request/${missedScanId}`)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to delete this record because of status REJECTED.`
        );
      });

    //Create new one for approving
    missedScanId = await createMissedScanRequest(requesterAccessToken, payload);

    //CASE: Test Approval Case Pending & Current login as the requester
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${missedScanId}/entityType/${MediaEntityTypeEnum.MISSED_SCAN}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(StatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(missedScanId);
      });

    //CASE: test Approval Case Pending & Current login as the first approval
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${missedScanId}/entityType/${MediaEntityTypeEnum.MISSED_SCAN}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(StatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(
          ActionTypeEnum['APPROVAL/REJECT']
        );
        expect(responseData.approverType).toEqual(TypeEnum.FIRST_APPROVALS);
        expect(responseData.entityId.id).toEqual(missedScanId);
      });

    //CASE: approve missedScan request
    approvalStatusPayload.approvalResult = true;
    approvalStatus = await findApprovalStatusByEntityIdAndType(
      missedScanId,
      MediaEntityTypeEnum.MISSED_SCAN,
      approverAccessToken
    );
    await updateApprovalStatus(
      approverAccessToken,
      approvalStatus.id,
      approvalStatusPayload
    );

    //CASE: test Approval Case Pending & Current login as the first approval after approved
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${missedScanId}/entityType/${MediaEntityTypeEnum.MISSED_SCAN}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(StatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(missedScanId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
      });

    //CASE: get approval request list case current login as admin
    const requestWorkflow = await getRequestWorkflowTypeByName(
      accessToken,
      WorkflowTypeEnum.MISSED_SCAN
    );
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking?requestWorkflowTypeId=${requestWorkflow.id}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      });

    //CASE: get approval request list by ESS user
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking?requestWorkflowTypeId=${requestWorkflow.id}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      });

    //CASE: test Approval Case Pending & Current login as the acknowledger
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${missedScanId}/entityType/${MediaEntityTypeEnum.MISSED_SCAN}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, acknowledgerAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(StatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.ACKNOWLEDGE);
        expect(responseData.approverType).toEqual(TypeEnum.ACKNOWLEDGERS);
        expect(responseData.entityId.id).toEqual(missedScanId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
      });

    //CASE: test acknowledge missedScan request with workflow
    await request(API_ENDPOINT)
      .patch(`/employee/approval-status-tracking/${approvalStatus.id}`)
      .send(approvalStatusPayload)
      .set(AUTHORIZATION_KEY, acknowledgerAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toBeGreaterThan(0);
      });

    //CASE: test Approval Case ACTIVE & Current login as the acknowledger
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${missedScanId}/entityType/${MediaEntityTypeEnum.MISSED_SCAN}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, acknowledgerAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(StatusEnum.ACTIVE);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(missedScanId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
        expect(responseData.acknowledgeUser.id).toEqual(acknowledgerUserId);
        expect(responseData.acknowledgeDate).toContain(today);
      });

    //CASE: Test Approval Case Active & Current login as the first approval
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${missedScanId}/entityType/${MediaEntityTypeEnum.MISSED_SCAN}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(StatusEnum.ACTIVE);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(missedScanId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
        expect(responseData.acknowledgeUser.id).toEqual(acknowledgerUserId);
        expect(responseData.acknowledgeDate).toContain(today);
      });

    //GET: notification for requester after approved
    await getNotification(
      requesterAccessToken,
      requesterUserId,
      approvalStatus.id
    );

    //GET: notification for requestFor after approved
    await getNotification(
      requestForAccessToken,
      requestForUserId,
      approvalStatus.id
    );

    //CASE: loging as requester & test delete after approved
    await request(API_ENDPOINT)
      .delete(`/employee/missed-scan-request/${missedScanId}`)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to delete this record because of status ACTIVE.`
        );
      });

    //CASE: login as requester to see record; expect actionType = NO and status = ACTIVE
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${missedScanId}/entityType/${MediaEntityTypeEnum.MISSED_SCAN}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.status).toEqual(StatusEnum.ACTIVE);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(missedScanId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
        expect(responseData.acknowledgeUser.id).toEqual(acknowledgerUserId);
        expect(responseData.acknowledgeDate).toContain(today);
      });
  });

  it('Employee Movement with Only Requester Workflow', async () => {
    //workflow containing only REQUESTER and first APPROVER
    const workflowOneSetInfo = await employeeWorkflowOnSetService(
      accessToken,
      false,
      true,
      MediaEntityTypeEnum.MISSED_SCAN
    );
    const officerEmployeeId = workflowOneSetInfo.officerEmployee.id;
    const requesterAccessToken = workflowOneSetInfo.officerEmployee.AccessToken;
    const approverAccessToken = workflowOneSetInfo.managerEmployee.AccessToken;
    const approverUserId = workflowOneSetInfo.managerEmployee.LoginInfo.userId;

    //get reason template id type OTHER
    const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);

    //CASE: create missedScan request case success with current date
    const payload = {
      employeeId: officerEmployeeId,
      reason: reason,
      reasonTemplateId: reasonTemplate.id,
      requestDate: today,
      scanTime: '08:00',
      status: StatusEnum.PENDING,
      documentIds: []
    };
    const missedScan = await request(API_ENDPOINT)
      .post(`/employee/missed-scan-request`)
      .send(payload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      });
    const missedScanId = missedScan.body.data.id;

    //CASE: get approval status info
    const approvalStatus = await findApprovalStatusByEntityIdAndType(
      missedScanId,
      MediaEntityTypeEnum.MISSED_SCAN,
      approverAccessToken
    );

    //CASE: login as approver after create
    await request(API_ENDPOINT)
      .get(`/employee/approval-status-tracking/${approvalStatus.id}`)
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toEqual(approvalStatus.id);
        expect(res.body.data.actionType).toEqual(
          ActionTypeEnum['APPROVAL/REJECT']
        );
        expect(res.body.data.status).toEqual(ApprovalStatusEnum.PENDING);
      });

    //GET: notification for APPROVER
    await getNotification(
      approverAccessToken,
      approverUserId,
      approvalStatus.id
    );

    //APPROVE: record by first approver; expect success since only one approver in workflow
    await updateApprovalStatus(approverAccessToken, approvalStatus.id, {
      approvalResult: true,
      reason: 'First Approver'
    });

    //GET: get approval status after approved; expect status = ACTIVE
    await request(API_ENDPOINT)
      .get(`/employee/approval-status-tracking/${approvalStatus.id}`)
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toEqual(approvalStatus.id);
        expect(res.body.data.actionType).toEqual(ActionTypeEnum.NO);
        expect(res.body.data.status).toEqual(ApprovalStatusEnum.ACTIVE);
      });
  });
});

interface IMissedScanDto {
  employeeId: number;
  reason: string;
  reasonTemplateId: 1;
  requestDate: Date | string;
  scanTime: Date | string;
  status: StatusEnum;
  documentIds: number[];
}

const createMissedScanRequest = async (
  accessToken: string,
  payload: IMissedScanDto
) => {
  const response = await request(API_ENDPOINT)
    .post(`/employee/missed-scan-request`)
    .send(payload)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
  return response.body.data.id;
};

const findMissedScanById = async (accessToken: string, id: number) => {
  await request(API_ENDPOINT)
    .get(`/employee/missed-scan-request/${id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toEqual(id);
    });
};
