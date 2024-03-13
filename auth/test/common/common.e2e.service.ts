import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/af_ZA';
import { WorkflowTypeEnum } from 'apps/shared-resources/common/enum/workflow-type.enum';
import { ReasonTemplateTypeEnum } from '../../apps/employee/src/reason-template/common/ts/enum/type.enum';
import { ReasonTemplate } from '../../apps/employee/src/reason-template/entities/reason-template.entity';
import { CompanyStructure } from '../../apps/employee/src/company-structure/entities/company-structure.entity';
import { DEFAULT_DATE_FORMAT } from '../../apps/shared-resources/common/dto/default-date-format';
import { dayJs } from '../../apps/shared-resources/common/utils/date-utils';
import {
  API_ENDPOINT,
  AUTHORIZATION_KEY,
  BEARER,
  PASSWORD,
  TOKEN_URL,
  USERNAME
} from '../../test/environment';
import { CompanyStructureTypeEnum } from '../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';
import { ScanTypeEnum } from '../../apps/employee/src/workshift-type/common/ts/enum/status-type.enum';
import { UpdateApprovalStatusTrackingDto } from '../../apps/employee/src/approval-status-tracking/dto/update-approval-status-tracking.dto';
import { ICreateCompanyStructureDto } from './../employee/company-structure/company-structure-e2e-spec';
import { createComponent } from './../employee/company-structure-component/company-structure-component-e2e-service';
import { createEmployee } from './../employee/employee-position-in-structure/create-employee.service';
import { PositionLevelTitleEnum } from './../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import { MediaEntityTypeEnum } from './../../apps/employee/src/media/common/ts/enums/entity-type.enum';

interface IGetOtpOptionDto {
  phone: string;
  email: string;
}
interface ICreateUser extends IGetOtpOptionDto {
  password: string;
  key: string;
  code: string;
}

interface ICreateCompanyStructureInfo {
  positionId: number;
  positionLevelId: any;
  teamId: any;
  departmentId: any;
  outletId: any;
  locationId: any;
  isDefaultPosition: boolean;
}

const getPermissionIdsByNames = async (
  names: string[],
  accessToken: string
): Promise<number[]> => {
  const result = await request(API_ENDPOINT)
    .get('/authentication/permission')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      if (!res.body?.data) {
        Logger.log(res.body);
      }
    });
  const arrayPermission = result.body.data;

  const arrayIds: number[] = [];
  arrayPermission.forEach((permission) => {
    if (names.includes(permission.name)) {
      arrayIds.push(permission.id);
    }
    if (permission.children && permission.children.length > 0) {
      permission.children.forEach((permission1) => {
        if (names.includes(permission1.name)) {
          arrayIds.push(permission1.id);
        }

        if (
          permission.children.children &&
          permission.children.children.length > 0
        ) {
          permission.children.children.forEach((permission2) => {
            if (names.includes(permission2.name)) {
              arrayIds.push(permission2.id);
            }
          });
        }
      });
    }
  });
  return arrayIds;
};

const getAccessToken = async (username?: string, password?: string) => {
  const authUsername = username ? username : USERNAME;
  const authPassword = password ? password : PASSWORD;
  const response = await request(API_ENDPOINT).post(TOKEN_URL).send({
    username: authUsername,
    password: authPassword
  });

  if (
    response.body?.data?.exp === 'token expired' ||
    response.body?.message === 'Bad token; invalid JSON'
  ) {
    await getAccessToken(authPassword, authPassword);
  }

  if (!response.body?.accessToken) {
    Logger.log(response.body);
  }

  return `${BEARER} ${response.body.accessToken}`;
};

const createRole = async (accessToken: string, permissionCodes: string[]) => {
  const permissionIds = await getPermissionIdsByNames(
    permissionCodes,
    accessToken
  );
  // create role
  const roleName = `role ${uuidv4()}`;
  const requestBody = {
    name: roleName,
    description: 'test',
    permissionId: permissionIds
  };
  const response = await request(API_ENDPOINT)
    .post('/authentication/role')
    .send(requestBody)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED);
  return response.body.data.id;
};

const getRandomDateFaker = () => {
  return new Date(faker.date.between({ from: '2000-01-01', to: '2005-01-01' }))
    .toISOString()
    .split('T')[0];
};

const getRandomBaseCurrentDateFaker = (isBeforeCurrentDate = false) => {
  const randomYear =
    Math.floor(
      Math.random() * (dayJs().year() - dayJs().subtract(4, 'year').year() + 1)
    ) + dayJs().subtract(4, 'year').year();

  const randomMonth = Math.floor(Math.random() * (1 + 12)); //random between 1 to 12
  const randomDay = Math.floor(Math.random() * (1 + 28)); //random between 1 to 28;

  const randomDate = dayJs(`${randomYear}-${randomMonth}-${randomDay}`).format(
    DEFAULT_DATE_FORMAT
  );

  if (!isBeforeCurrentDate) {
    return randomDate;
  } else if (isBeforeCurrentDate && dayJs().isBefore(randomDate)) {
    getRandomBaseCurrentDateFaker(true);
  }
  return randomDate;
};

const getRandomPasswordFaker = () => {
  return `${faker.internet.password().replace(/_/g, 'aaA')}@2024`;
};

const getRandomEmailFaker = () => {
  return faker.internet.email();
};

const getRandomUsernameFaker = () => {
  return faker.internet.userName();
};

const getRandomPhoneFaker = () => {
  return `0${faker.string.numeric(9)}`;
};

const getRandomNumberFaker = () => {
  return faker.number.int({ min: 1000, max: 999999 }).toString();
};

const getRandomString = (length = 16) => {
  return faker.string.alphanumeric(length);
};

const getPositionLevelByName = async (
  levelTitle: PositionLevelTitleEnum,
  accessToken: string
) => {
  const positionLevels = await request(API_ENDPOINT)
    .get(`/employee/position-level`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  return positionLevels.body.data.find(
    (positionLevel: any) =>
      String(positionLevel.levelTitle).toLowerCase() ===
      levelTitle.toLowerCase()
  );
};

const createCompanyStructureTree = async (
  positionLevelId: number,
  accessToken: string,
  isSubTeam = false,
  positionName?: PositionLevelTitleEnum
) => {
  const companyStructureDto: ICreateCompanyStructureDto = {
    parentId: null,
    type: CompanyStructureTypeEnum.COMPANY,
    isHq: false,
    fingerprintDeviceId: null,
    positionLevelId: null
  };

  let companyStructureCompany: any;
  let companyStructureOutlet: any;

  let mpath: string = '';

  const company = await findCompanyStructureByType(
    CompanyStructureTypeEnum.COMPANY,
    accessToken
  );
  if (company.length) {
    companyStructureCompany = company[0];
  } else {
    companyStructureCompany = await createCompanyStructure(
      accessToken,
      companyStructureDto
    );
  }
  mpath = mpath.concat(companyStructureCompany.id);

  companyStructureDto.type = CompanyStructureTypeEnum.LOCATION;
  companyStructureDto.parentId = companyStructureCompany.id;
  const companyStructureLocation = await createCompanyStructure(
    accessToken,
    companyStructureDto
  );

  //create outlet
  const outlet = await findCompanyStructureByType(
    CompanyStructureTypeEnum.OUTLET,
    accessToken
  );

  const hqOutlet = outlet.find((item: any) => item.isHq);
  if (!hqOutlet) {
    const fingerPrintPayload = {
      ipAddress: uuidv4(),
      specification: 'figner print device',
      description: 'this is finger print device',
      modelName: uuidv4(),
      port: 5434
    };
    const fingerPrintDeviceId = await request(API_ENDPOINT)
      .post('/employee/finger-print-device')
      .send(fingerPrintPayload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      });
    companyStructureDto.type = CompanyStructureTypeEnum.OUTLET;
    companyStructureDto.parentId = companyStructureLocation.id;
    companyStructureDto.isHq = true;
    companyStructureDto.fingerprintDeviceId = fingerPrintDeviceId.body.data.id;
    companyStructureOutlet = await createCompanyStructure(
      accessToken,
      companyStructureDto
    );
    mpath = mpath.concat('.', companyStructureLocation.id);
  } else {
    companyStructureOutlet = hqOutlet;

    const newCompanyStructureLocation: CompanyStructure =
      await getCompanyStructureById(accessToken, companyStructureOutlet.id);

    mpath = mpath.concat(
      '.',
      newCompanyStructureLocation.parentId.id.toString()
    );
  }

  mpath = mpath.concat('.', companyStructureOutlet.id);

  companyStructureDto.type = CompanyStructureTypeEnum.DEPARTMENT;
  companyStructureDto.parentId = companyStructureOutlet.id;
  delete companyStructureDto.fingerprintDeviceId;
  delete companyStructureDto.isHq;

  const companyStructureDepartment = await createCompanyStructure(
    accessToken,
    companyStructureDto
  );

  mpath = mpath.concat('.', companyStructureDepartment.id);

  //create division
  companyStructureDto.type = CompanyStructureTypeEnum.TEAM;
  companyStructureDto.parentId = companyStructureDepartment.id;
  let companyStructureDivision = await createCompanyStructure(
    accessToken,
    companyStructureDto
  );
  mpath = mpath.concat('.', companyStructureDivision.id);

  companyStructureDto.type = CompanyStructureTypeEnum.POSITION;
  companyStructureDto.parentId = companyStructureDivision.id;

  if (isSubTeam) {
    const positionLevel = await getPositionLevelByName(
      PositionLevelTitleEnum.CHIEF,
      accessToken
    );
    companyStructureDto.positionLevelId = positionLevel.id;
  } else {
    companyStructureDto.positionLevelId = positionLevelId;
  }
  let companyStructurePosition = await createCompanyStructure(
    accessToken,
    companyStructureDto,
    isSubTeam ? PositionLevelTitleEnum.CHIEF : positionName
  );

  const structurePositionInParentTeam = await request(API_ENDPOINT)
    .get(`/employee/company-structure/${companyStructurePosition.id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) =>
      expect(res.body.data.id).toEqual(companyStructurePosition.id)
    );

  //CASE: need sub team
  if (isSubTeam) {
    companyStructureDto.type = CompanyStructureTypeEnum.TEAM;
    companyStructureDto.parentId = companyStructureDivision.id;
    companyStructureDivision = await createCompanyStructure(
      accessToken,
      companyStructureDto
    );
    mpath = mpath.concat('.', companyStructureDivision.id);
    //create position
    companyStructureDto.type = CompanyStructureTypeEnum.POSITION;
    companyStructureDto.parentId = companyStructureDivision.id;
    companyStructureDto.positionLevelId = positionLevelId;
    companyStructurePosition = await createCompanyStructure(
      accessToken,
      companyStructureDto,
      positionName
    );

    //ADD: position under parent team
    companyStructurePosition['parentTeam'] =
      structurePositionInParentTeam.body.data;
  }

  const structurePosition = await request(API_ENDPOINT)
    .get(`/employee/company-structure/${companyStructurePosition.id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) =>
      expect(res.body.data.id).toEqual(companyStructurePosition.id)
    );

  companyStructurePosition['mpath'] = mpath = mpath.concat(
    '.L',
    structurePosition.body.data.positionLevelId.levelNumber
  );

  return companyStructurePosition;
};

const getCompanyStructureById = async (
  accessToken: string,
  companyStructureId: number
): Promise<CompanyStructure> => {
  const newCompanyStructureLocation = await request(API_ENDPOINT)
    .get(`/employee/company-structure/${companyStructureId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.id).toEqual(companyStructureId));

  return newCompanyStructureLocation.body.data;
};

const createCompanyStructure = async (
  accessToken: string,
  createCompanyStructureDto: ICreateCompanyStructureDto,
  name: string = ''
) => {
  const companyStructureComponentName = `${name}-${getRandomString()}`;
  const companyStructureComponentId = await createComponent(
    companyStructureComponentName,
    createCompanyStructureDto.type
  );

  const response = await request(API_ENDPOINT)
    .post('/employee/company-structure')
    .send({
      companyStructureComponentId,
      parentId: createCompanyStructureDto.parentId,
      isHq: createCompanyStructureDto?.isHq ?? null,
      fingerprintDeviceId:
        createCompanyStructureDto?.fingerprintDeviceId ?? null,
      positionLevelId: createCompanyStructureDto?.positionLevelId ?? null
    })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });

  return response.body.data;
};

const createEmployeeWithCompanyStructure = async (accessToken: string) => {
  const positionLevel = await getPositionLevelByName(
    PositionLevelTitleEnum.MANAGER,
    accessToken
  );
  const companyStructurePosition = await createCompanyStructureTree(
    positionLevel.id,
    accessToken
  );
  return await createEmployee(companyStructurePosition.id, accessToken);
};

//check if position, team, department, outlet and location is exists and related.
const validateCompanyStructure = async (
  positionId: number,
  accessToken: string
) => {
  const positionInfo = await findCompanyStructureById(positionId, accessToken);
  const teamParentInfo = await findCompanyStructureById(
    positionInfo.parentId.id,
    accessToken
  );
  const departmentInfo = await findCompanyStructureById(
    teamParentInfo.parentId.id,
    accessToken
  );
  const outletInfo = await findCompanyStructureById(
    departmentInfo.parentId.id,
    accessToken
  );
  const locationInfo = await findCompanyStructureById(
    outletInfo.parentId.id,
    accessToken
  );
  return {
    positionId: positionId,
    positionLevelId: positionInfo.positionLevelId.id,
    teamId: teamParentInfo.id,
    departmentId: departmentInfo.id,
    outletId: outletInfo.id,
    locationId: locationInfo.id,
    isDefaultPosition: false
  };
};

const findCompanyStructureById = async (id: number, accessToken: string) => {
  const companyStructure = await request(API_ENDPOINT)
    .get(`/employee/company-structure/${id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
  return companyStructure.body.data;
};

const findCompanyStructureByType = async (
  type: CompanyStructureTypeEnum,
  accessToken: string
) => {
  const companyStructure = await request(API_ENDPOINT)
    .get(`/employee/company-structure?type=${type}`)
    .set(AUTHORIZATION_KEY, accessToken);
  return companyStructure.body.data;
};

const findEmployeeById = async (id: number, accessToken: string) => {
  const employeeInfo = await request(API_ENDPOINT)
    .get(`/employee/employee-master-information/${id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
  return employeeInfo.body.data;
};

const assignPositionToEmployee = async (
  employeeId: number,
  companyStructureInfo: ICreateCompanyStructureInfo,
  accessToken: string
) => {
  await request(API_ENDPOINT)
    .post(`/employee/${employeeId}/employee-position`)
    .send(companyStructureInfo)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
};

const getAllEmployeePositionById = async (id: number, accessToken: string) => {
  const employeePositionInfo = await request(API_ENDPOINT)
    .get(`/employee/${id}/employee-position?orderBy=id&orderDirection=ASC`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data).not.toBeNull();
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  return employeePositionInfo.body.data;
};

const findApprovalStatusByEntityIdAndType = async (
  id: number,
  type: MediaEntityTypeEnum,
  accessToken: string
) => {
  const approvalStatus = await request(API_ENDPOINT)
    .get(`/employee/approval-status-tracking/entity/${id}/entityType/${type}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toBeGreaterThan(0);
    });
  return approvalStatus.body.data;
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
      expect(res.body.data.id).toEqual(approvalStatusId);
    });
  return response.body.data.id;
};

const getRequestApprovalWorkflowByRemark = async (
  name: MediaEntityTypeEnum,
  remark: string,
  accessToken: string
) => {
  const requestWorkflowTypes = await request(API_ENDPOINT)
    .get(`/employee/request-workflow-type`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  const findRequestWorkflowTypeByName = requestWorkflowTypes.body.data.find(
    (requestWorkflowType: any) => requestWorkflowType.name === name
  );
  return findRequestWorkflowTypeByName.requestApprovalWorkflow.find(
    (requestApprovalWorkflow: any) =>
      requestApprovalWorkflow.description === remark
  );
};

const getRequestWorkflowTypeByName = async (
  accessToken: string,
  name: WorkflowTypeEnum
) => {
  const requestWorkflowTypes = await request(API_ENDPOINT)
    .get(`/employee/request-workflow-type`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  return requestWorkflowTypes.body.data.find(
    (requestWorkflowType: any) => requestWorkflowType.name === name
  );
};

const getReasonTemplateTypeOTHER = async (accessToken: string) => {
  const reasonTemplateInfo = await request(API_ENDPOINT)
    .get(`/employee/reason-template?type=OTHER`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data[0].id).not.toBeNull();
    });
  return reasonTemplateInfo.body.data.find(
    (reasonTemplate: ReasonTemplate) =>
      reasonTemplate.type === ReasonTemplateTypeEnum.OTHER
  );
};

//create new user
const activateUserAccount = async (phone: string, accessToken: string) => {
  //get otp code
  const getOtpOptionDto: IGetOtpOptionDto = {
    phone,
    email: null
  };
  const activationCodeInfo = await request(API_ENDPOINT)
    .post('/auth/get-otp')
    .send(getOtpOptionDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.code.length).toBeGreaterThan(0);
      expect(res.body.data.key.length).toBeGreaterThan(0);
    })
    .expect(HttpStatus.CREATED);

  //activate account
  const createUserDto: ICreateUser = {
    phone,
    email: null,
    password: PASSWORD,
    key: activationCodeInfo.body.data.key,
    code: activationCodeInfo.body.data.code
  };
  await request(API_ENDPOINT)
    .post('/auth/active-account-create-new-user')
    .send(createUserDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.token).not.toBeNull();
      expect(res.body.data.token.length).toBeGreaterThan(0);
    });
  //user information
  const userInfo = await findUserByUsername(phone, accessToken);

  return {
    userId: userInfo.id,
    username: createUserDto.phone,
    password: createUserDto.password
  };
};

const generateWorkingShift = async (accessToken: string) => {
  const workingShiftPayload = {
    name: getRandomString(),
    workshiftTypeId: 1,
    startWorkingTime: '07:00',
    endWorkingTime: '05:00',
    scanType: ScanTypeEnum.TWO_TIMES
  };
  const newWorkingShift = await request(API_ENDPOINT)
    .post(`/employee/working-shift`)
    .send(workingShiftPayload)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
  return newWorkingShift.body.data;
};

//find user by username
const findUserByUsername = async (username: string, accessToken: string) => {
  const userInfo = await request(API_ENDPOINT)
    .get(`/authentication/user?keywords=${username}&limit=10`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  return userInfo.body.data[0];
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

export {
  getAccessToken,
  getPermissionIdsByNames,
  createRole,
  getRandomDateFaker,
  createCompanyStructureTree,
  createEmployeeWithCompanyStructure,
  createCompanyStructure,
  getRandomEmailFaker,
  getRandomPasswordFaker,
  getRandomPhoneFaker,
  getRandomUsernameFaker,
  getRandomNumberFaker,
  getRandomString,
  findCompanyStructureById as findCompanyStructure,
  validateCompanyStructure,
  activateUserAccount,
  findEmployeeById,
  getPositionLevelByName,
  assignPositionToEmployee,
  getRandomBaseCurrentDateFaker,
  getRequestApprovalWorkflowByRemark,
  findApprovalStatusByEntityIdAndType,
  getAllEmployeePositionById,
  getReasonTemplateTypeOTHER,
  generateWorkingShift,
  updateApprovalStatus,
  getNotification,
  getRequestWorkflowTypeByName
};
