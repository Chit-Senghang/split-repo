import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { UpdateApprovalStatusTrackingDto } from '../../../apps/employee/src/approval-status-tracking/dto/update-approval-status-tracking.dto';
import { ApprovalStatusEnum } from '../../../apps/employee/src/approval-status-tracking/common/ts/enum/approval-status.enum';
import { WorkflowTypeEnum } from '../../../apps/shared-resources/common/enum/workflow-type.enum';
import {
  findApprovalStatusByEntityIdAndType,
  findEmployeeById,
  generateWorkingShift,
  getAccessToken,
  getAllEmployeePositionById,
  getRandomString,
  getReasonTemplateTypeOTHER,
  getRequestWorkflowTypeByName
} from '../../common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { dayJs } from '../../../apps/shared-resources/common/utils/date-utils';
import {
  employeeWorkflowOnSetService,
  movementOneSetServiceWithAdmin
} from '../workflow/employee-workflow-one-set.service';
import { EmploymentTypeEnum } from '../../../apps/employee/src/employee/enum/employee-status.enum';
import { DEFAULT_DATE_FORMAT } from '../../../apps/shared-resources/common/dto/default-date-format';
import { MediaEntityTypeEnum } from './../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import { EmployeeMovementStatusEnum } from './../../../apps/employee/src/employee-movement/ts/enums/movement-status.enum';
import { ActionTypeEnum } from './../../../apps/employee/src/approval-status-tracking/common/ts/enum/action-type.enum';
import { TypeEnum } from './../../../apps/employee/src/request-approval-workflow/common/ts/enum/type.enum';

describe('EmployeeMovementTest', () => {
  let accessToken: string;
  const today = dayJs().format(DEFAULT_DATE_FORMAT);
  let reason: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
    reason = getRandomString();
  });

  it('Employee Movement CRUD with admin', async () => {
    const workflowOneSetInfo =
      await movementOneSetServiceWithAdmin(accessToken);
    const companyStructurePositionInfo =
      workflowOneSetInfo.companyStructurePositionInfo;
    const internPositionCompanyStructure =
      companyStructurePositionInfo.internPositionCompanyStructureInfo;
    const crewPositionCompanyStructure =
      companyStructurePositionInfo.crewPositionCompanyStructureInfo;
    const officerCompanyStructurePosition =
      companyStructurePositionInfo.officerPositionCompanyStructureInfo;
    const employeeId = workflowOneSetInfo.employeeInfo.id;
    let employeePositions = await getAllEmployeePositionById(
      employeeId,
      accessToken
    );

    //CASE: test employee duplicate default position unique constrain
    crewPositionCompanyStructure.isDefaultPosition = true;
    await request(API_ENDPOINT)
      .post(`/employee/${employeeId}/employee-position`)
      .send(crewPositionCompanyStructure)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You already have a default position.`
        );
      });

    //get reason template id type OTHER
    const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);

    //CASE: test create employee movement (intern -> crew) normal case
    const employeeMovementPayload: IEmployeeMovementDto = {
      employeeId: +employeeId,
      requestMovementEmployeePositionId: +employeePositions[0].id,
      previousCompanyStructurePositionId:
        +internPositionCompanyStructure.positionId,
      newCompanyStructurePositionId: +crewPositionCompanyStructure.positionId,
      effectiveDate: today,
      documentIds: [],
      reason,
      reasonTemplateId: reasonTemplate.id
    };
    const employeeMovement = await request(API_ENDPOINT)
      .post(`/employee/employee-movement/position/1`)
      .send(employeeMovementPayload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      });
    const employeeMovementId = employeeMovement.body.data.id;

    //CASE: test find one after create
    await request(API_ENDPOINT)
      .get(`/employee/employee-movement/${employeeMovementId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toEqual(employeeMovementId);
      });

    //CASE: test create employee movement (officer -> crew) case move to existing position
    employeeMovementPayload.requestMovementEmployeePositionId =
      +employeePositions[1].id;
    employeeMovementPayload.previousCompanyStructurePositionId =
      +officerCompanyStructurePosition.positionId;
    employeeMovementPayload.newCompanyStructurePositionId =
      +crewPositionCompanyStructure.positionId;
    await request(API_ENDPOINT)
      .post(`/employee/employee-movement/position/1`)
      .send(employeeMovementPayload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `Position already exists.`
        );
      });

    //CASE: test delete case status ACTIVE
    await request(API_ENDPOINT)
      .delete(`/employee/employee-movement/${employeeMovementId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to delete this record because of status ACTIVE.`
        );
      });

    //CASE: create employment type movement (FULL_TIME -> FULL_TIME) duplicate case
    delete employeeMovementPayload.requestMovementEmployeePositionId;
    delete employeeMovementPayload.previousCompanyStructurePositionId;
    delete employeeMovementPayload.newCompanyStructurePositionId;
    employeeMovementPayload['newEmploymentType'] = EmploymentTypeEnum.FULL_TIME;
    await request(API_ENDPOINT)
      .post(`/employee/employee-movement/position/1`)
      .send(employeeMovementPayload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `employment type already exists.`
        );
      });

    //CASE: create employment type movement (FULL_TIME -> PART_TIME) normal case
    employeeMovementPayload['newEmploymentType'] = EmploymentTypeEnum.PART_TIME;
    await createEmployeeMovement(employeeMovementPayload, accessToken);

    //CASE: employment type should've changed to PART_TIME
    await checkIfEmploymentTypeHasMoved(
      employeeId,
      EmploymentTypeEnum.PART_TIME,
      accessToken
    );

    //CASE: create employee workingshift duplicate case
    const employee = await findEmployeeById(employeeId, accessToken);
    delete employeeMovementPayload['newEmploymentType'];
    employeeMovementPayload['newWorkingShiftId'] = employee.workingShiftId.id;
    await request(API_ENDPOINT)
      .post(`/employee/employee-movement/position/1`)
      .send(employeeMovementPayload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `workingShift already exists.`
        );
      });

    //generate working shift for moving
    const newWorkingShift = await generateWorkingShift(accessToken);

    //CASE: test create employee movement moving workingshift
    employeeMovementPayload['newWorkingShiftId'] = newWorkingShift.id;
    await createEmployeeMovement(employeeMovementPayload, accessToken);

    //CASE: employee workingShift should be equal to newWorkingShift
    await checkIfWorkingShiftHasMoved(
      employeeId,
      newWorkingShift.id,
      accessToken
    );

    //CASE: move position (crew -> intern) and employment type (PART_TIME -> FULL_TIME) at the same time
    employeePositions = await getAllEmployeePositionById(
      employeeId,
      accessToken
    );
    delete employeeMovementPayload['newWorkingShiftId'];
    employeeMovementPayload['newCompanyStructurePositionId'] =
      +internPositionCompanyStructure.positionId;
    employeeMovementPayload['previousCompanyStructurePositionId'] =
      +crewPositionCompanyStructure.positionId;
    employeeMovementPayload['requestMovementEmployeePositionId'] =
      +employeePositions[1].id;
    employeeMovementPayload['newEmploymentType'] = EmploymentTypeEnum.FULL_TIME;
    await createEmployeeMovement(employeeMovementPayload, accessToken);

    //CASE: check if position is move
    await checkIfPositionHasMoved(
      employeeId,
      employeePositions[1].id,
      accessToken
    );

    //CASE: employment type should've changed to FULL_TIME
    await checkIfEmploymentTypeHasMoved(
      employeeId,
      EmploymentTypeEnum.FULL_TIME,
      accessToken
    );

    //CASE: move position (intern -> crew) and workingShift at the same time
    employeePositions = await getAllEmployeePositionById(
      employeeId,
      accessToken
    );
    delete employeeMovementPayload['newEmploymentType'];
    employeeMovementPayload['newCompanyStructurePositionId'] =
      +crewPositionCompanyStructure.positionId;
    employeeMovementPayload['previousCompanyStructurePositionId'] =
      +internPositionCompanyStructure.positionId;
    employeeMovementPayload['requestMovementEmployeePositionId'] =
      +employeePositions[1].id;
    employeeMovementPayload['newWorkingShiftId'] = employee.workingShiftId.id;
    await createEmployeeMovement(employeeMovementPayload, accessToken);

    //CASE: move employment type and workingShift at the same time
    delete employeeMovementPayload['newCompanyStructurePositionId'];
    delete employeeMovementPayload['previousCompanyStructurePositionId'];
    delete employeeMovementPayload['requestMovementEmployeePositionId'];
    employeeMovementPayload['newEmploymentType'] = EmploymentTypeEnum.PART_TIME;
    employeeMovementPayload['newWorkingShiftId'] = newWorkingShift.id;
    await createEmployeeMovement(employeeMovementPayload, accessToken);

    //CASE: employment type should've changed to PART_TIME
    await checkIfEmploymentTypeHasMoved(
      employeeId,
      EmploymentTypeEnum.PART_TIME,
      accessToken
    );

    //CASE: employee workingShift should be equal to newWorkingShift
    await checkIfWorkingShiftHasMoved(
      employeeId,
      newWorkingShift.id,
      accessToken
    );

    //CASE: move position (crew -> intern), employment type (PART_TIME -> FULL_TIME) and workingShift at the same time
    employeePositions = await getAllEmployeePositionById(
      employeeId,
      accessToken
    );
    employeeMovementPayload['newCompanyStructurePositionId'] =
      +internPositionCompanyStructure.positionId;
    employeeMovementPayload['previousCompanyStructurePositionId'] =
      +crewPositionCompanyStructure.positionId;
    employeeMovementPayload['requestMovementEmployeePositionId'] =
      +employeePositions[1].id;
    employeeMovementPayload['newEmploymentType'] = EmploymentTypeEnum.FULL_TIME;
    employeeMovementPayload['newWorkingShiftId'] = employee.workingShiftId.id;
    await createEmployeeMovement(employeeMovementPayload, accessToken);

    //CASE: employee workingShift should be equal to newWorkingShift
    await checkIfWorkingShiftHasMoved(
      employeeId,
      employee.workingShiftId.id,
      accessToken
    );

    //CASE: employment type should've changed to FULL_TIME
    await checkIfEmploymentTypeHasMoved(
      employeeId,
      EmploymentTypeEnum.FULL_TIME,
      accessToken
    );

    //CASE: check if position is move
    await checkIfPositionHasMoved(
      employeeId,
      employeePositions[1].id,
      accessToken
    );

    //CASE: create movement with no purpose
    delete employeeMovementPayload['newCompanyStructurePositionId'];
    delete employeeMovementPayload['previousCompanyStructurePositionId'];
    delete employeeMovementPayload['requestMovementEmployeePositionId'];
    delete employeeMovementPayload['newEmploymentType'];
    delete employeeMovementPayload['newWorkingShiftId'];
    await validateMovingPositionWithBadRequestExpectation(
      employeeMovementPayload,
      accessToken
    );

    //CASE: moving position without requestMovementEmployeePositionId
    employeeMovementPayload['newCompanyStructurePositionId'] =
      +crewPositionCompanyStructure.positionId;
    employeeMovementPayload['previousCompanyStructurePositionId'] =
      +internPositionCompanyStructure.positionId;
    await validateMovingPositionWithBadRequestExpectation(
      employeeMovementPayload,
      accessToken,
      'requestMovementEmployeePositionId'
    );

    //CASE: moving position without previousCompanyStructurePositionId
    delete employeeMovementPayload['previousCompanyStructurePositionId'];
    employeeMovementPayload['requestMovementEmployeePositionId'] =
      +employeePositions[1].id;
    await validateMovingPositionWithBadRequestExpectation(
      employeeMovementPayload,
      accessToken,
      'previousCompanyStructurePositionId'
    );
    //CASE: moving position without newCompanyStructurePositionId
    delete employeeMovementPayload['newCompanyStructurePositionId'];
    employeeMovementPayload['previousCompanyStructurePositionId'] =
      +internPositionCompanyStructure.positionId;
    await validateMovingPositionWithBadRequestExpectation(
      employeeMovementPayload,
      accessToken,
      'newCompanyStructurePositionId'
    );
  });

  it('Employee Movement CRUD with workflow', async () => {
    const workflowOneSetInfo = await employeeWorkflowOnSetService(
      accessToken,
      true,
      false,
      MediaEntityTypeEnum.MOVEMENT
    );
    //get reason template id type OTHER
    const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);
    //crew
    const crewCompanyStructurePosition =
      workflowOneSetInfo.crewPositionCompanyStructureInfo;
    //intern
    const internCompanyStructurePosition =
      workflowOneSetInfo.internPositionCompanyStructureInfo;
    //officer
    const officerEmployeeId = workflowOneSetInfo.officerEmployee.id;
    const officerCompanyStructurePosition =
      workflowOneSetInfo.officerEmployee.CompanyStructurePositionInfo;
    const officerEmployeePosition = await getAllEmployeePositionById(
      officerEmployeeId,
      accessToken
    );
    const requestForAccessToken =
      workflowOneSetInfo.officerEmployee.AccessToken;
    const requestForUserId =
      workflowOneSetInfo.officerEmployee.LoginInfo.userId;
    //supervisor
    const requesterUserId =
      workflowOneSetInfo.supervisorEmployee.LoginInfo.userId;
    const requesterAccessToken =
      workflowOneSetInfo.supervisorEmployee.AccessToken;
    //manager
    const approverUserId = workflowOneSetInfo.managerEmployee.LoginInfo.userId;
    const approverAccessToken = workflowOneSetInfo.managerEmployee.AccessToken;
    //head of department
    const acknowledgerUserId = workflowOneSetInfo.headEmployee.LoginInfo.userId;
    const acknowledgerAccessToken = workflowOneSetInfo.headEmployee.AccessToken;

    //CASE: test create employee movement request with workflow normal case
    const employeeMovementWorkflowPayload = {
      employeeId: officerEmployeeId,
      requestMovementEmployeePositionId: +officerEmployeePosition[0].id,
      previousCompanyStructurePositionId:
        +officerCompanyStructurePosition.positionId,
      newCompanyStructurePositionId: +crewCompanyStructurePosition.positionId,
      effectiveDate: today,
      documentIds: [],
      reason,
      reasonTemplateId: +reasonTemplate.id
    };
    const employeeMovementWithWorkFlow = await request(API_ENDPOINT)
      .post(
        `/employee/employee-movement/position/${officerEmployeePosition[0].id}`
      )
      .send(employeeMovementWorkflowPayload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    //CASE: test find one after create employee movement with workflow
    await request(API_ENDPOINT)
      .get(
        `/employee/employee-movement/${employeeMovementWithWorkFlow.body.data.id}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toBeGreaterThan(0);
      });

    //CASE: test update employee movement with workflow
    employeeMovementWorkflowPayload.newCompanyStructurePositionId =
      +internCompanyStructurePosition.positionId;
    await request(API_ENDPOINT)
      .patch(
        `/employee/employee-movement/${employeeMovementWithWorkFlow.body.data.id}`
      )
      .send(employeeMovementWorkflowPayload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toBeGreaterThan(0);
      });

    //CASE: test check if approver received notification after create employee movement with workflow
    await request(API_ENDPOINT)
      .get(`/employee/notification`)
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data[0].isNotReadCount).toBeGreaterThan(0);
      });

    //CASE: test reject employee movement with workflow
    let approvalStatus = await findApprovalStatusByEntityIdAndType(
      employeeMovementWithWorkFlow.body.data.id,
      MediaEntityTypeEnum.MOVEMENT,
      approverAccessToken
    );

    //CASE: test check if approver received notification after create employee movement with workflow
    await getNotification(
      approverAccessToken,
      approverUserId,
      approvalStatus.id
    );

    const approvalStatusPayload = {
      approvalResult: false,
      reason: 'other'
    };

    await updateApprovalStatus(
      approverAccessToken,
      approvalStatus.id,
      approvalStatusPayload
    );

    //CASE: test employee position is not suppose to move
    await request(API_ENDPOINT)
      .get(
        `/employee/${officerEmployeeId}/employee-position?orderBy=id&orderDirection=ASC`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data).not.toBeNull();
        expect(res.body.data[0].id).toEqual(officerEmployeePosition[0].id);
      });

    //CASE: test check if approver and requester received notification after rejected
    await getNotification(
      requesterAccessToken,
      requesterUserId,
      approvalStatus.id
    );

    //CASE: test delete employee movement status rejected with workflow
    await request(API_ENDPOINT)
      .delete(
        `/employee/employee-movement/${employeeMovementWithWorkFlow.body.data.id}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to delete this record because of status REJECTED.`
        );
      });

    //create another one for approve
    const newMovementId = await createEmployeeMovement(
      employeeMovementWorkflowPayload,
      requesterAccessToken
    );

    //CASE: Test Approval Case Pending & Current login as the requester
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${newMovementId}/entityType/${MediaEntityTypeEnum.MOVEMENT}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(EmployeeMovementStatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(newMovementId);
      });

    //CASE: test Approval Case Pending & Current login as the first approval
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${newMovementId}/entityType/${MediaEntityTypeEnum.MOVEMENT}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;

        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(EmployeeMovementStatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(
          ActionTypeEnum['APPROVAL/REJECT']
        );
        expect(responseData.approverType).toEqual(TypeEnum.FIRST_APPROVALS);
        expect(responseData.entityId.id).toEqual(newMovementId);
      });

    //CASE: test approve employee movement with workflow
    approvalStatusPayload.approvalResult = true;
    approvalStatus = await findApprovalStatusByEntityIdAndType(
      newMovementId,
      MediaEntityTypeEnum.MOVEMENT,
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
        `/employee/approval-status-tracking/entity/${newMovementId}/entityType/${MediaEntityTypeEnum.MOVEMENT}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(EmployeeMovementStatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(newMovementId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
      });

    //CASE: get approval request list case current login as admin
    const requestWorkflowTypeMovement = await getRequestWorkflowTypeByName(
      accessToken,
      WorkflowTypeEnum.MOVEMENT
    );
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking?requestWorkflowTypeId=${requestWorkflowTypeMovement.id}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      });

    //CASE: get approval request list by ESS user
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking?requestWorkflowTypeId=${requestWorkflowTypeMovement.id}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      });

    //CASE: test Approval Case Pending & Current login as the acknowledger
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${newMovementId}/entityType/${MediaEntityTypeEnum.MOVEMENT}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, acknowledgerAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(EmployeeMovementStatusEnum.PENDING);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.ACKNOWLEDGE);
        expect(responseData.approverType).toEqual(TypeEnum.ACKNOWLEDGERS);
        expect(responseData.entityId.id).toEqual(newMovementId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
      });

    //CASE: test acknowledge employee movement with workflow
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
        `/employee/approval-status-tracking/entity/${newMovementId}/entityType/${MediaEntityTypeEnum.MOVEMENT}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, acknowledgerAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(EmployeeMovementStatusEnum.ACTIVE);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(newMovementId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
        expect(responseData.acknowledgeUser.id).toEqual(acknowledgerUserId);
        expect(responseData.acknowledgeDate).toContain(today);
      });

    //CASE: Test Approval Case Active & Current login as the first approval
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking/entity/${newMovementId}/entityType/${MediaEntityTypeEnum.MOVEMENT}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, approverAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.id).toBeGreaterThan(0);
        expect(responseData.status).toEqual(EmployeeMovementStatusEnum.ACTIVE);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(newMovementId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
        expect(responseData.acknowledgeUser.id).toEqual(acknowledgerUserId);
        expect(responseData.acknowledgeDate).toContain(today);
      });

    //CASE: test employee position is suppose to move
    await request(API_ENDPOINT)
      .get(
        `/employee/${officerEmployeeId}/employee-position?orderBy=id&orderDirection=ASC`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data).not.toBeNull();
        expect(res.body.data[0].id).not.toEqual(officerEmployeePosition[0].id);
      });

    //GET: notification for requester after approved
    await getNotification(
      requesterAccessToken,
      requesterUserId,
      approvalStatus.id
    );

    //GET: notification for request for after approved
    await getNotification(
      requestForAccessToken,
      requestForUserId,
      approvalStatus.id
    );

    //CASE: test delete after approved
    await request(API_ENDPOINT)
      .delete(`/employee/employee-movement/${newMovementId}`)
      .set(AUTHORIZATION_KEY, accessToken)
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
        `/employee/approval-status-tracking/entity/${newMovementId}/entityType/${MediaEntityTypeEnum.MOVEMENT}?isViewInformation=true}`
      )
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        const responseData = res.body.data;
        expect(responseData.status).toEqual(EmployeeMovementStatusEnum.ACTIVE);
        expect(responseData.createdBy.id).toEqual(requesterUserId);
        expect(responseData.actionType).toEqual(ActionTypeEnum.NO);
        expect(responseData.entityId.id).toEqual(newMovementId);
        expect(responseData.firstApprovalReason).not.toBeNull();
        expect(responseData.firstApprovalUser.id).toEqual(approverUserId);
        expect(responseData.firstApprovalDate).toContain(today);
        expect(responseData.acknowledgeUser.id).toEqual(acknowledgerUserId);
        expect(responseData.acknowledgeDate).toContain(today);
      });
  });

  it('Move employment type', async () => {
    const workflowOneSetInfo = await employeeWorkflowOnSetService(
      accessToken,
      true,
      false,
      MediaEntityTypeEnum.MOVEMENT
    );
    //get reason template id type OTHER
    const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);
    //crew
    const crewCompanyStructurePosition =
      workflowOneSetInfo.crewPositionCompanyStructureInfo;
    //officer
    const officerEmployeeId = workflowOneSetInfo.officerEmployee.id;
    const officerCompanyStructurePosition =
      workflowOneSetInfo.officerEmployee.CompanyStructurePositionInfo;
    const officerEmployeePosition = await getAllEmployeePositionById(
      officerEmployeeId,
      accessToken
    );
    //supervisor
    const requesterAccessToken =
      workflowOneSetInfo.supervisorEmployee.AccessToken;

    //generate working shift for moving
    const newWorkingShift = await generateWorkingShift(accessToken);

    //CASE: test move employment type
    const payload = {
      employeeId: officerEmployeeId,
      effectiveDate: today,
      documentIds: [],
      reason,
      reasonTemplateId: +reasonTemplate.id,
      newEmploymentType: EmploymentTypeEnum.PART_TIME
    };
    let employeeMovement = await request(API_ENDPOINT)
      .post(`/employee/employee-movement/position/1`)
      .send(payload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      });
    let employeeMovementId = employeeMovement.body.data.id;

    //CASE: try to update newWorkingShift and position information
    payload['newWorkingShiftId'] = newWorkingShift.id;
    payload['requestMovementEmployeePositionId'] =
      +officerEmployeePosition[0].id;
    payload['previousCompanyStructurePositionId'] =
      +officerCompanyStructurePosition.positionId;
    payload['newCompanyStructurePositionId'] =
      +crewCompanyStructurePosition.positionId;
    await request(API_ENDPOINT)
      .patch(`/employee/employee-movement/${employeeMovementId}`)
      .send(payload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You can not update data that you did not create.`
        );
      });

    //CASE: create another one for employment type testing
    delete payload.newEmploymentType;
    employeeMovement = await request(API_ENDPOINT)
      .post(`/employee/employee-movement/position/1`)
      .send(payload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      });
    employeeMovementId = employeeMovement.body.data.id;

    //CASE: try to update employment type
    payload['newEmploymentType'] = EmploymentTypeEnum.INTERN;
    await request(API_ENDPOINT)
      .patch(`/employee/employee-movement/${employeeMovementId}`)
      .send(payload)
      .set(AUTHORIZATION_KEY, requesterAccessToken)
      .expect(HttpStatus.FORBIDDEN)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You can not update data that you did not create.`
        );
      });
  });

  it('Create with LastMovementDate case', async () => {
    const workflowOneSetInfo =
      await movementOneSetServiceWithAdmin(accessToken);
    const companyStructurePositionInfo =
      workflowOneSetInfo.companyStructurePositionInfo;
    const internPositionCompanyStructure =
      companyStructurePositionInfo.internPositionCompanyStructureInfo;
    const crewPositionCompanyStructure =
      companyStructurePositionInfo.crewPositionCompanyStructureInfo;
    const employeeId = workflowOneSetInfo.employeeInfo.id;
    const employeePositions = workflowOneSetInfo.employeeInfo.positions;

    //get reason template id type OTHER
    const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);

    //CASE: test create employee movement normal case
    const employeeMovementPayload = {
      employeeId: +employeeId,
      requestMovementEmployeePositionId: +employeePositions[0].id,
      previousCompanyStructurePositionId:
        +internPositionCompanyStructure.positionId,
      newCompanyStructurePositionId: +crewPositionCompanyStructure.positionId,
      effectiveDate: today,
      documentIds: [],
      reason,
      reasonTemplateId: reasonTemplate.id
    };

    const employeeMovementId = await createEmployeeMovement(
      employeeMovementPayload,
      accessToken
    );

    //CASE: get one after create and expect last movement date = null
    await request(API_ENDPOINT)
      .get(`/employee/employee-movement/${employeeMovementId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toEqual(employeeMovementId);
        expect(res.body.data.lastMovementDate).toBeNull();
      });

    //CASE: create one more movement to check last movement date
    employeeMovementPayload.previousCompanyStructurePositionId =
      crewPositionCompanyStructure.positionId;
    employeeMovementPayload.newCompanyStructurePositionId =
      internPositionCompanyStructure.positionId;
    employeeMovementPayload.requestMovementEmployeePositionId =
      +employeePositions[1].id;
    const newEmployeeMovementId = await createEmployeeMovement(
      employeeMovementPayload,
      accessToken
    );

    //CASE: get one after create and expect last movement date
    await request(API_ENDPOINT)
      .get(`/employee/employee-movement/${newEmployeeMovementId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data.id).toEqual(newEmployeeMovementId);
        expect(res.body.data.lastMovementDate).toEqual(today);
      });
  });

  it('Employee Movement with Only Requester Workflow', async () => {
    //CREATE: workflow containing only REQUESTER and first APPROVER
    const workflowOneSetInfo = await employeeWorkflowOnSetService(
      accessToken,
      true,
      true,
      MediaEntityTypeEnum.MOVEMENT
    );

    const {
      createEmployeeMovementDto,
      requesterAccessToken,
      approverUserId,
      approverAccessToken
    } = await mappingCreateEmployeeMovementDto(
      accessToken,
      workflowOneSetInfo,
      reason,
      today
    );

    //CREATE: employee movement
    const employeeMovementId = await createEmployeeMovement(
      createEmployeeMovementDto,
      requesterAccessToken
    );

    //GET: approval status
    const approvalStatus = await findApprovalStatusByEntityIdAndType(
      employeeMovementId,
      MediaEntityTypeEnum.MOVEMENT,
      approverAccessToken
    );

    //GET: get approval status as APPROVER; expect status = PENDING
    await getApprovalStatus(
      approverAccessToken,
      approvalStatus.id,
      ApprovalStatusEnum.PENDING,
      ActionTypeEnum['APPROVAL/REJECT']
    );

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
    await getApprovalStatus(
      approverAccessToken,
      approvalStatus.id,
      ApprovalStatusEnum.ACTIVE,
      ActionTypeEnum.NO
    );
  });
});
interface IEmployeeMovementDto {
  employeeId: number;
  effectiveDate: string;
  documentIds: number[];
  reason: string;
  reasonTemplateId: number;
  requestMovementEmployeePositionId?: number;
  previousCompanyStructurePositionId?: number;
  newCompanyStructurePositionId?: number;
  newEmploymentType?: EmploymentTypeEnum;
  newWorkingShiftId?: number;
}

const createEmployeeMovement = async (
  employeeMovementPayload: IEmployeeMovementDto,
  accessToken: string
): Promise<number> => {
  const employeeMovement = await request(API_ENDPOINT)
    .post(`/employee/employee-movement/position/1`)
    .send(employeeMovementPayload)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
  return employeeMovement.body.data.id;
};

const validateMovingPositionWithBadRequestExpectation = async (
  movementPayload: IEmployeeMovementDto,
  accessToken: string,
  positionPayloadElement: string = ''
) => {
  await request(API_ENDPOINT)
    .post(`/employee/employee-movement/position/1`)
    .send(movementPayload)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.BAD_REQUEST)
    .expect((err) => {
      const errorResponse = JSON.parse(err.text);
      if (
        !movementPayload.newCompanyStructurePositionId &&
        !movementPayload.previousCompanyStructurePositionId &&
        !movementPayload.requestMovementEmployeePositionId
      ) {
        expect(errorResponse.errors[0].message).toEqual(
          `employeeMovement must at least have one purpose.`
        );
      } else {
        expect(errorResponse.errors[0].message).toEqual(
          `${positionPayloadElement} is required.`
        );
      }
    });
};

const checkIfPositionHasMoved = async (
  employeeId: number,
  employeePositionId: number,
  accessToken: string
) => {
  await request(API_ENDPOINT)
    .get(
      `/employee/${employeeId}/employee-position?orderBy=id&orderDirection=ASC`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data).not.toBeNull();
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[1].id).not.toEqual(employeePositionId);
    });
};

const checkIfEmploymentTypeHasMoved = async (
  employeeId: number,
  employmentType: EmploymentTypeEnum,
  accessToken: string
) => {
  await request(API_ENDPOINT)
    .get(`/employee/employee-master-information/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toEqual(employeeId);
      expect(res.body.data.employmentType).toEqual(employmentType);
    });
};

const checkIfWorkingShiftHasMoved = async (
  employeeId: number,
  workingShiftId: number,
  accessToken: string
) => {
  await request(API_ENDPOINT)
    .get(`/employee/employee-master-information/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toEqual(employeeId);
      expect(res.body.data.workingShiftId.id).toEqual(workingShiftId);
    });
};

const updateApprovalStatus = async (
  accessToken: string,
  approvalStatusId: number,
  updateApprovalStatusDto: UpdateApprovalStatusTrackingDto
): Promise<number> => {
  const response = await request(API_ENDPOINT)
    .patch(`/employee/approval-status-tracking/${approvalStatusId}`)
    .send(updateApprovalStatusDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toBeGreaterThan(0);
    });

  return response.body.data.id;
};

const getApprovalStatus = async (
  accessToken: string,
  approvalStatusId: number,
  status: ApprovalStatusEnum,
  actionType: ActionTypeEnum
) => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/approval-status-tracking/${approvalStatusId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toEqual(approvalStatusId);
      expect(res.body.data.actionType).toEqual(actionType);
      expect(res.body.data.status).toEqual(status);
    });

  return response.body.data;
};

const mappingCreateEmployeeMovementDto = async (
  accessToken: string,
  workflowOneSetInfo: any,
  reason: string,
  date: string
) => {
  //GET: reason template id type OTHER
  const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);

  //GET: crew company structure position
  const crewCompanyStructurePosition =
    workflowOneSetInfo.crewPositionCompanyStructureInfo;

  //GET: info of position officer as REQUESTER
  const officerEmployeeId = workflowOneSetInfo.officerEmployee.id;
  const officerCompanyStructurePosition =
    workflowOneSetInfo.officerEmployee.CompanyStructurePositionInfo;
  const officerEmployeePosition = await getAllEmployeePositionById(
    officerEmployeeId,
    accessToken
  );

  const requesterAccessToken = workflowOneSetInfo.officerEmployee.AccessToken;

  //GET: info of position manager as APPROVER
  const approverUserId = workflowOneSetInfo.managerEmployee.LoginInfo.userId;
  const approverAccessToken = workflowOneSetInfo.managerEmployee.AccessToken;

  const createEmployeeMovementDto = {
    employeeId: officerEmployeeId,
    requestMovementEmployeePositionId: Number(officerEmployeePosition[0].id),
    previousCompanyStructurePositionId: Number(
      officerCompanyStructurePosition.positionId
    ),
    newCompanyStructurePositionId: Number(
      crewCompanyStructurePosition.positionId
    ),
    effectiveDate: date,
    documentIds: [],
    reason,
    reasonTemplateId: +reasonTemplate.id
  };

  return {
    requesterAccessToken,
    approverUserId,
    approverAccessToken,
    createEmployeeMovementDto
  };
};

const getNotification = async (
  accessToken: string,
  userId: number,
  approvalStatusId: number
) => {
  await request(API_ENDPOINT)
    .get(`/employee/notification`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data[0].isNotReadCount).toBeGreaterThan(0);
      expect(res.body.data[1].userId).toEqual(userId);
      expect(res.body.data[1].approvalStatus.id).toEqual(approvalStatusId);
    });
};
