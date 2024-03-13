import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import {
  activateUserAccount,
  assignPositionToEmployee,
  createCompanyStructure,
  createCompanyStructureTree,
  findEmployeeById,
  getAccessToken,
  getAllEmployeePositionById,
  getPositionLevelByName,
  getRequestApprovalWorkflowByRemark,
  validateCompanyStructure
} from './../../../test/common/common.e2e.service';
import { PositionLevelTitleEnum } from './../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import { CompanyStructureTypeEnum } from './../../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';
import { createEmployee } from './../employee-position-in-structure/create-employee.service';
import {
  RequestWorkflowPayload,
  createRequestApprovalWorkflowByType,
  getWorkflowTypeByName
} from './components-create-workflow.service';

const movementOneSetServiceWithAdmin = async (accessToken: string) => {
  //get position level info by name
  const internPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.INTERN,
    accessToken
  );
  const crewPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.CREW,
    accessToken
  );
  const officerPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.OFFICER,
    accessToken
  );
  //create intern level position
  const internPositionCompanyStructureId = await createCompanyStructureTree(
    +internPositionLevelInfo.id,
    accessToken,
    false,
    PositionLevelTitleEnum.INTERN
  );
  const internPositionCompanyStructureInfo = await validateCompanyStructure(
    +internPositionCompanyStructureId['id'],
    accessToken
  );
  const employeeId: number = await createEmployee(
    +internPositionCompanyStructureId['id'],
    accessToken
  );
  //create crew level position
  const crewPositionCompanyStructureId = await createCompanyStructureTree(
    +crewPositionLevelInfo.id,
    accessToken,
    false,
    PositionLevelTitleEnum.CREW
  );
  const crewPositionCompanyStructureInfo = await validateCompanyStructure(
    +crewPositionCompanyStructureId['id'],
    accessToken
  );
  //create officer level position
  const officerPositionCompanyStructureId = await createCompanyStructureTree(
    +officerPositionLevelInfo.id,
    accessToken,
    false,
    PositionLevelTitleEnum.OFFICER
  );
  const officerPositionCompanyStructureInfo = await validateCompanyStructure(
    +officerPositionCompanyStructureId['id'],
    accessToken
  );
  //assign officer position to employee
  await assignPositionToEmployee(
    +employeeId,
    officerPositionCompanyStructureInfo,
    accessToken
  );
  //get all employee positions
  const employeePositions = await getAllEmployeePositionById(
    +employeeId,
    accessToken
  );
  return {
    employeeInfo: {
      id: employeeId,
      positions: employeePositions
    },
    companyStructurePositionInfo: {
      internPositionCompanyStructureInfo,
      crewPositionCompanyStructureInfo,
      officerPositionCompanyStructureInfo
    }
  };
};

const employeeWorkflowOnSetService = async (
  accessToken: string,
  isMovementModule: boolean,
  isNoRequestFor = false,
  workflowType: MediaEntityTypeEnum
) => {
  //get position level info by name
  const internPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.INTERN,
    accessToken
  );
  const crewPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.CREW,
    accessToken
  );
  const officerPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.OFFICER,
    accessToken
  );
  const supervisorPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.SUPERVISOR,
    accessToken
  );
  const managerPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.MANAGER,
    accessToken
  );
  const headPositionLevelInfo = await getPositionLevelByName(
    PositionLevelTitleEnum.HEAD_OF_DEPARTMENT,
    accessToken
  );
  //find workflow id type MOVEMENT
  const workFlowInfo = await getWorkflowTypeByName(workflowType, accessToken);
  //create request approval workflow
  const requestApprovalWorkflowPayload: RequestWorkflowPayload = {
    enable: true,
    description: isNoRequestFor
      ? `Second ${workflowType} With Requester Only`
      : `${workflowType}_e2e`,
    requesters: [
      {
        positionLevelId: isNoRequestFor
          ? +officerPositionLevelInfo.id
          : +supervisorPositionLevelInfo.id
      }
    ],
    requestFors: isNoRequestFor
      ? []
      : [
          {
            positionLevelId: +officerPositionLevelInfo.id
          }
        ],
    firstApprovers: [
      {
        positionLevelId: +managerPositionLevelInfo.id,
        companyStructureDepartmentId: null,
        companyStructureTeamId: null
      }
    ],
    secondApprovers: [],
    acknowledgers: isNoRequestFor
      ? []
      : [
          {
            positionLevelId: +headPositionLevelInfo.id,
            companyStructureDepartmentId: null,
            companyStructureTeamId: null
          }
        ]
  };
  const existingRequestApprovalWorkflow =
    await getRequestApprovalWorkflowByRemark(
      workflowType,
      requestApprovalWorkflowPayload.description,
      accessToken
    );

  if (!existingRequestApprovalWorkflow) {
    await createRequestApprovalWorkflowByType(
      workFlowInfo.id,
      accessToken,
      requestApprovalWorkflowPayload
    );
  }
  //create officer employee and requestFor user
  const officerPositionCompanyStructureId = await createCompanyStructureTree(
    officerPositionLevelInfo.id,
    accessToken,
    false,
    PositionLevelTitleEnum.OFFICER
  );
  const officerPositionCompanyStructureInfo = await validateCompanyStructure(
    officerPositionCompanyStructureId['id'],
    accessToken
  );
  const officerEmployeeId: number = await createEmployee(
    officerPositionCompanyStructureId['id'],
    accessToken
  );
  const officerEmployeeInfo = await findEmployeeById(
    officerEmployeeId,
    accessToken
  );
  const requestForUserLoginInfo = await activateUserAccount(
    officerEmployeeInfo.contacts[0].contact,
    accessToken
  );
  const requestForAccessToken: string = await getAccessToken(
    requestForUserLoginInfo.username,
    requestForUserLoginInfo.password
  );
  //create supervisor employee and requester user
  const companyStructurePayload = {
    parentId: +officerPositionCompanyStructureInfo.teamId,
    type: CompanyStructureTypeEnum.POSITION,
    positionLevelId: +supervisorPositionLevelInfo.id
  };
  const supervisorPositionCompanyStructureId = await createCompanyStructure(
    accessToken,
    companyStructurePayload,
    PositionLevelTitleEnum.SUPERVISOR
  );
  const supervisorPositionCompanyStructureInfo = await validateCompanyStructure(
    supervisorPositionCompanyStructureId['id'],
    accessToken
  );
  const supervisorEmployeeId: number = await createEmployee(
    supervisorPositionCompanyStructureId['id'],
    accessToken
  );
  const supervisorEmployeeInfo = await findEmployeeById(
    supervisorEmployeeId,
    accessToken
  );
  const requesterUserLoginInfo = await activateUserAccount(
    supervisorEmployeeInfo.contacts[0].contact,
    accessToken
  );
  const requesterAccessToken: string = await getAccessToken(
    requesterUserLoginInfo.username,
    requesterUserLoginInfo.password
  );

  let internPositionCompanyStructureInfo: any;
  let crewPositionCompanyStructureInfo: any;
  if (isMovementModule) {
    //create crew position
    companyStructurePayload.positionLevelId = +internPositionLevelInfo.id;
    const internPositionCompanyStructureId = await createCompanyStructure(
      accessToken,
      companyStructurePayload,
      PositionLevelTitleEnum.INTERN
    );
    internPositionCompanyStructureInfo = await validateCompanyStructure(
      internPositionCompanyStructureId['id'],
      accessToken
    );
    //create crew position
    companyStructurePayload.positionLevelId = +crewPositionLevelInfo.id;
    const crewPositionCompanyStructureId = await createCompanyStructure(
      accessToken,
      companyStructurePayload,
      PositionLevelTitleEnum.CREW
    );
    crewPositionCompanyStructureInfo = await validateCompanyStructure(
      crewPositionCompanyStructureId['id'],
      accessToken
    );
  }
  //create manager employee and approver user
  companyStructurePayload.positionLevelId = +managerPositionLevelInfo.id;
  const managerPositionCompanyStructureId = await createCompanyStructure(
    accessToken,
    companyStructurePayload,
    PositionLevelTitleEnum.MANAGER
  );
  const managerPositionCompanyStructureInfo = await validateCompanyStructure(
    managerPositionCompanyStructureId['id'],
    accessToken
  );
  const managerEmployeeId: number = await createEmployee(
    managerPositionCompanyStructureId['id'],
    accessToken
  );
  const managerEmployeeInfo = await findEmployeeById(
    managerEmployeeId,
    accessToken
  );
  const approverUserLoginInfo = await activateUserAccount(
    managerEmployeeInfo.contacts[0].contact,
    accessToken
  );
  const approverAccessToken: string = await getAccessToken(
    approverUserLoginInfo.username,
    approverUserLoginInfo.password
  );
  //create head Of department employee and acknowledger
  companyStructurePayload.positionLevelId = +headPositionLevelInfo.id;
  const headPositionCompanyStructureId = await createCompanyStructure(
    accessToken,
    companyStructurePayload,
    PositionLevelTitleEnum.HEAD_OF_DEPARTMENT
  );
  const headPositionCompanyStructureInfo = await validateCompanyStructure(
    headPositionCompanyStructureId['id'],
    accessToken
  );
  const headEmployeeId: number = await createEmployee(
    headPositionCompanyStructureId['id'],
    accessToken
  );
  const headEmployeeInfo = await findEmployeeById(headEmployeeId, accessToken);
  const acknowledgerUserLoginInfo = await activateUserAccount(
    headEmployeeInfo.contacts[0].contact,
    accessToken
  );
  const acknowledgerAccessToken: string = await getAccessToken(
    acknowledgerUserLoginInfo.username,
    acknowledgerUserLoginInfo.password
  );
  return {
    internPositionCompanyStructureInfo,
    crewPositionCompanyStructureInfo,
    officerEmployee: {
      id: officerEmployeeId,
      CompanyStructurePositionInfo: officerPositionCompanyStructureInfo,
      LoginInfo: requestForUserLoginInfo,
      AccessToken: requestForAccessToken
    },
    supervisorEmployee: {
      id: supervisorEmployeeId,
      CompanyStructurePositionInfo: supervisorPositionCompanyStructureInfo,
      LoginInfo: requesterUserLoginInfo,
      AccessToken: requesterAccessToken
    },
    managerEmployee: {
      id: managerEmployeeId,
      CompanyStructurePositionInfo: managerPositionCompanyStructureInfo,
      LoginInfo: approverUserLoginInfo,
      AccessToken: approverAccessToken
    },
    headEmployee: {
      id: headEmployeeId,
      CompanyStructurePositionInfo: headPositionCompanyStructureInfo,
      LoginInfo: acknowledgerUserLoginInfo,
      AccessToken: acknowledgerAccessToken
    }
  };
};
export { movementOneSetServiceWithAdmin, employeeWorkflowOnSetService };
