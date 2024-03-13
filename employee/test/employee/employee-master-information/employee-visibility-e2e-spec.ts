import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { PositionLevel } from '../../../apps/employee/src/position-level/entities/position-level.entity';
import { CompanyStructure } from '../../../apps/employee/src/company-structure/entities/company-structure.entity';
import {
  activateUserAccount,
  createCompanyStructureTree,
  findEmployeeById,
  getAccessToken,
  getPositionLevelByName
} from '../../../test/common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { Employee } from '../../../apps/employee/src/employee/entity/employee.entity';
import { PositionLevelTitleEnum } from '../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';

describe('Test Employee Visibility', () => {
  let accessToken: string;
  let crossDepartmentEmployeeId: number;
  beforeAll(async () => {
    accessToken = await getAccessToken();
  });
  it('Create with same team and position', async () => {
    //CREATE: employee with position manager
    const {
      employee: managerEmployee,
      userAccessToken: managerAccessToken,
      companyStructurePosition
    } = await createEmployeeByPositionLevelTitle(
      accessToken,
      PositionLevelTitleEnum.MANAGER,
      false
    );

    crossDepartmentEmployeeId = managerEmployee.id;

    //GET: one after create
    await findEmployeeById(managerEmployee.id, managerAccessToken);

    //CREATE: new employee with position manager as well
    const secondManagerEmployeeId = await createEmployee(
      companyStructurePosition.id,
      accessToken
    );

    //LOGIN: as manager and get employee; expect not found
    await getAllEmployeesExpectNoEmployeeIdGiven(
      managerAccessToken,
      secondManagerEmployeeId,
      false
    );

    //LOGIN: as admin; expect found
    await getAllEmployeesExpectNoEmployeeIdGiven(
      accessToken,
      secondManagerEmployeeId,
      true
    );
  });
  it('Create employee with sub team and cross department', async () => {
    //CREATE: company structure with position MANAGER and CHIEF
    const {
      companyStructurePosition,
      userAccessToken: managerUserAccessToken,
      employee: managerEmployee,
      chiefAccessToken,
      chiefEmployee
    } = await createEmployeeByPositionLevelTitle(
      accessToken,
      PositionLevelTitleEnum.MANAGER,
      true
    );

    //CREATE: employee with MANAGER position
    const employeeId = await createEmployee(
      companyStructurePosition.id,
      accessToken
    );

    //GET: employee after create
    await findEmployeeById(employeeId, managerUserAccessToken);

    //LOGIN: as MANAGER and get all employee; expect not found chief employee
    await getAllEmployeesExpectNoEmployeeIdGiven(
      managerUserAccessToken,
      chiefEmployee.id
    );

    //LOGIN: as MANAGER and get all employee; expect not found chief employee
    await getAllEmployeesExpectNoEmployeeIdGiven(
      managerUserAccessToken,
      chiefEmployee.id,
      false
    );

    //LOGIN: as admin; expect found
    await getAllEmployeesExpectNoEmployeeIdGiven(
      accessToken,
      chiefEmployee.id,
      true
    );

    //LOGIN: as CHIEF and get all employee; expect found MANAGER employee
    await getAllEmployeesExpectNoEmployeeIdGiven(
      chiefAccessToken,
      managerEmployee.id,
      true
    );

    //GET: employee cross department; expect not found
    await getAllEmployeesExpectNoEmployeeIdGiven(
      managerUserAccessToken,
      crossDepartmentEmployeeId,
      false
    );

    //CASE: login as admin; expect found
    await getAllEmployeesExpectNoEmployeeIdGiven(
      accessToken,
      crossDepartmentEmployeeId,
      true
    );
  });
});

const createEmployeeByPositionLevelTitle = async (
  accessToken: string,
  positionLevelTitleName: PositionLevelTitleEnum,
  isSubTeam: boolean
): Promise<{
  employee: Employee;
  userAccessToken: string;
  companyStructurePosition: CompanyStructure;
  chiefAccessToken: string;
  chiefEmployee: Employee;
}> => {
  //GET: position level manager
  const positionLevel: PositionLevel = await getPositionLevelByName(
    positionLevelTitleName,
    accessToken
  );

  //CREATE: company structure tree
  const companyStructurePosition: CompanyStructure =
    await createCompanyStructureTree(
      positionLevel.id,
      accessToken,
      isSubTeam,
      positionLevelTitleName
    );

  //CREATE: employee and active new user
  const { userAccessToken, employee } = await activeUserByEmployee(
    companyStructurePosition,
    accessToken
  );

  //CREATE: employee in parent team
  let chiefAccessToken: string;
  let chiefEmployee: Employee;
  if (isSubTeam) {
    //CREATE: employee and active new user
    const { userAccessToken: token, employee: employee } =
      await activeUserByEmployee(
        companyStructurePosition['parentTeam'],
        accessToken
      );
    chiefAccessToken = token;
    chiefEmployee = employee;
  }

  return {
    employee,
    userAccessToken,
    companyStructurePosition,
    chiefAccessToken,
    chiefEmployee
  };
};

const activeUserByEmployee = async (
  companyStructurePosition: CompanyStructure,
  accessToken: string
): Promise<{ userAccessToken: string; employee: Employee }> => {
  //CREATE: new employee with given position
  const employeeId: number = await createEmployee(
    companyStructurePosition.id,
    accessToken
  );

  //GET: employee by id
  const employee: Employee = await findEmployeeById(employeeId, accessToken);

  //ACTIVATE: user
  const approverUserLoginInfo = await activateUserAccount(
    employee.contacts[0].contact,
    accessToken
  );

  //LOGIN: as new user
  const userAccessToken: string = await getAccessToken(
    approverUserLoginInfo.username,
    approverUserLoginInfo.password
  );

  return { userAccessToken, employee };
};

const getAllEmployeesExpectNoEmployeeIdGiven = async (
  accessToken: string,
  employeeId: number,
  isFound = false
) => {
  await request(API_ENDPOINT)
    .get('/employee/employee-master-information')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      //CHECK: because other tests might create a lot of employees
      if (res.body.data.length) {
        if (isFound) {
          expect(
            res.body.data.find(
              (employee: Employee) => employee.id === employeeId
            ).id
          ).toEqual(employeeId);
        } else {
          expect(
            res.body.data.find(
              (employee: Employee) => employee.id === employeeId
            )
          ).toBeUndefined();
        }
      }
    });
};
