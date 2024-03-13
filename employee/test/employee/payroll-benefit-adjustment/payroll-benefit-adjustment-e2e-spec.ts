import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { AdjustmentDetailStatusEnum } from '../../../apps/employee/src/payroll-benefit-adjustment/enum/status.enum';
import { DefaultBenefitAdjustmentTypeEnum } from '../../../apps/employee/src/benefit-adjustment-type/enums/benefit-adjustment-type.enum';
import { DEFAULT_DATE_FORMAT } from '../../../apps/shared-resources/common/dto/default-date-format';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { BenefitAdjustmentType } from '../../../apps/employee/src/benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { BenefitComponent } from '../../../apps/employee/src/benefit-component/entities/benefit-component.entity';
import { CreatePayrollBenefitAdjustmentDto } from '../../../apps/employee/src/payroll-benefit-adjustment/dto/create-payroll-benefit-adjustment.dto';
import { dayJs } from '../../../apps/shared-resources/common/utils/date-utils';
import {
  getAccessToken,
  getReasonTemplateTypeOTHER
} from '../../../test/common/common.e2e.service';
import { movementOneSetServiceWithAdmin } from '../workflow/employee-workflow-one-set.service';
import { EmployeeMovement } from '../../../apps/employee/src/employee-movement/entities/employee-movement.entity';

describe('Test Payroll Benefit Adjustment', () => {
  let accessToken: string;
  let newEmployeeId: number;
  beforeAll(async () => {
    accessToken = await getAccessToken();
    const response = await createEmployeeMovement(accessToken);
    newEmployeeId = response.employeeId;
  });

  describe('Test Create Payroll Benefit Adjustment', () => {
    it('Create Payroll With Movement Id, Get and Update', async () => {
      const { employeeId, employeeMovementId } =
        await createEmployeeMovement(accessToken);
      const benefitAdjustmentTypes =
        await getBenefitAdjustmentTypes(accessToken);
      const benefitComponents =
        await getBenefitComponentBaseSalary(accessToken);
      const benefitAdjustmentTypeMovementId = benefitAdjustmentTypes.find(
        (benefitAdjustmentType: BenefitAdjustmentType) =>
          benefitAdjustmentType.name ===
          DefaultBenefitAdjustmentTypeEnum.MOVEMENT
      ).id;

      //CASE: create payroll benefit adjustment with movement success
      const payrollBenefitAdjustmentDto: CreatePayrollBenefitAdjustmentDto = {
        adjustmentTypeId: benefitAdjustmentTypeMovementId,
        reason: 'From Test Payroll Benefit Adjustment',
        employeeId: employeeId,
        employeeMovementId: employeeMovementId,
        detail: [
          {
            id: null,
            isPostProbation: false,
            status: null,
            benefitComponentId: benefitComponents.at(0).id,
            effectiveDateFrom: dayJs().format(DEFAULT_DATE_FORMAT) as any,
            effectiveDateTo: dayJs()
              .add(1, 'year')
              .format(DEFAULT_DATE_FORMAT) as any,
            adjustAmount: 500
          }
        ]
      };

      const responseCreated = await request(API_ENDPOINT)
        .post('/employee/payroll-benefit-adjustment')
        .send(payrollBenefitAdjustmentDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      //CASE: get one after create
      await request(API_ENDPOINT)
        .get(
          `/employee/payroll-benefit-adjustment/${responseCreated.body.data.id}`
        )
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.data.id).toEqual(responseCreated.body.data.id);
          expect(res.body.data.adjustmentTotalAmount).toEqual(
            payrollBenefitAdjustmentDto.detail[0].adjustAmount
          );
          expect(res.body.data.employeeMovement.id).toEqual(employeeMovementId);
          expect(
            res.body.data.payrollBenefitAdjustmentDetail[0].adjustAmount
          ).toEqual(payrollBenefitAdjustmentDto.detail[0].adjustAmount);
          expect(
            dayJs(
              res.body.data.payrollBenefitAdjustmentDetail[0].effectiveDateTo
            ).format(DEFAULT_DATE_FORMAT)
          ).toEqual(payrollBenefitAdjustmentDto.detail[0].effectiveDateTo);
          expect(
            dayJs(
              res.body.data.payrollBenefitAdjustmentDetail[0].effectiveDateFrom
            ).format(DEFAULT_DATE_FORMAT)
          ).toEqual(payrollBenefitAdjustmentDto.detail[0].effectiveDateFrom);
          expect(
            res.body.data.payrollBenefitAdjustmentDetail[0].isPostProbation
          ).toEqual(payrollBenefitAdjustmentDto.detail[0].isPostProbation);
          expect(
            res.body.data.payrollBenefitAdjustmentDetail[0].status
          ).toEqual(AdjustmentDetailStatusEnum.ACTIVE);
        });

      //CASE: create payroll benefit adjustment with error case because benefit adjustment type = Movement
      payrollBenefitAdjustmentDto.employeeMovementId = null;
      await request(API_ENDPOINT)
        .post('/employee/payroll-benefit-adjustment')
        .send(payrollBenefitAdjustmentDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) =>
          expect(res.body.errors[0].message).toEqual(
            'Employee Movement must not be empty with adjustment type movement.'
          )
        );

      //CASE: create with benefit adjustment type not Movement; expect success
      const benefitAdjustmentTypeIdNotMovement = benefitAdjustmentTypes.find(
        (benefitAdjustmentType: BenefitAdjustmentType) =>
          benefitAdjustmentType.name !==
          DefaultBenefitAdjustmentTypeEnum.MOVEMENT
      ).id;
      payrollBenefitAdjustmentDto.adjustmentTypeId =
        benefitAdjustmentTypeIdNotMovement;

      await request(API_ENDPOINT)
        .post('/employee/payroll-benefit-adjustment')
        .send(payrollBenefitAdjustmentDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      //CASE: create with wrong employee movement id
      const employeeMovementIds = await getEmployeeMovements(accessToken);
      payrollBenefitAdjustmentDto.adjustmentTypeId =
        benefitAdjustmentTypeMovementId;
      payrollBenefitAdjustmentDto.employeeMovementId =
        employeeMovementIds.at(0) + 1;

      await request(API_ENDPOINT)
        .post('/employee/payroll-benefit-adjustment')
        .send(payrollBenefitAdjustmentDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) =>
          expect(res.body.errors[0].message).toEqual(
            `Resource employee movement of ${
              employeeMovementIds.at(0) + 1
            } not found`
          )
        );

      //CASE: create with employee movement that does not match with employee
      payrollBenefitAdjustmentDto.employeeMovementId = employeeMovementId;
      payrollBenefitAdjustmentDto.employeeId = newEmployeeId;
      await request(API_ENDPOINT)
        .post('/employee/payroll-benefit-adjustment')
        .send(payrollBenefitAdjustmentDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) =>
          expect(res.body.errors[0].message).toEqual(
            'Employee movement does not match with employee.'
          )
        );

      //CASE: create with benefit adjustment type not movement, but give employee movement id
      payrollBenefitAdjustmentDto.employeeMovementId = employeeMovementId;
      payrollBenefitAdjustmentDto.adjustmentTypeId =
        benefitAdjustmentTypeIdNotMovement;
      await request(API_ENDPOINT)
        .post('/employee/payroll-benefit-adjustment')
        .send(payrollBenefitAdjustmentDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) =>
          expect(res.body.errors[0].message).toEqual(
            `Employee movement is not required with adjustment type not movement.`
          )
        );

      //CASE: update payroll benefit adjustment with ACTIVE record
      payrollBenefitAdjustmentDto.employeeMovementId = null;
      await request(API_ENDPOINT)
        .patch(
          `/employee/payroll-benefit-adjustment/${responseCreated.body.data.id}`
        )
        .send(payrollBenefitAdjustmentDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.FORBIDDEN)
        .expect((res) => {
          expect(res.body.errors[0].message).toEqual(
            'You can not update this record, because the status is ACTIVE.'
          );
        });

      //CASE: get all payroll benefit adjustments
      await request(API_ENDPOINT)
        .get('/employee/payroll-benefit-adjustment')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));
    });
  });
});

const createEmployeeMovement = async (
  accessToken: string
): Promise<{
  employeeId: number;
  employeeMovementId: number;
}> => {
  const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);
  const workflowOneSetInfo = await movementOneSetServiceWithAdmin(accessToken);

  const companyStructurePositionInfo =
    workflowOneSetInfo.companyStructurePositionInfo;
  const internPositionCompanyStructure =
    companyStructurePositionInfo.internPositionCompanyStructureInfo;
  const crewPositionCompanyStructure =
    companyStructurePositionInfo.crewPositionCompanyStructureInfo;
  const employeeId = workflowOneSetInfo.employeeInfo.id;
  const employeePositions = workflowOneSetInfo.employeeInfo.positions;

  const employeeMovementPayload = {
    employeeId: +employeeId,
    requestMovementEmployeePositionId: +employeePositions[0].id,
    previousCompanyStructurePositionId:
      +internPositionCompanyStructure.positionId,
    newCompanyStructurePositionId: +crewPositionCompanyStructure.positionId,
    effectiveDate: dayJs().format(DEFAULT_DATE_FORMAT),
    documentIds: [],
    reason: 'From Test',
    reasonTemplateId: reasonTemplate.id
  };

  const employeeMovementNormalCase = await request(API_ENDPOINT)
    .post(`/employee/employee-movement/position/${employeePositions[0].id}`)
    .send(employeeMovementPayload)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });

  return {
    employeeId,
    employeeMovementId: employeeMovementNormalCase.body.data.id
  };
};

const getBenefitAdjustmentTypes = async (
  accessToken: string
): Promise<BenefitAdjustmentType[]> => {
  const responses = await request(API_ENDPOINT)
    .get(`/employee/benefit-adjustment-type`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));

  return responses.body.data;
};

const getBenefitComponentBaseSalary = async (
  accessToken: string
): Promise<BenefitComponent[]> => {
  const responses = await request(API_ENDPOINT)
    .get('/employee/benefit-component')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.length).not.toBeNull());

  return responses.body.data;
};

const getEmployeeMovements = async (accessToken: string): Promise<number[]> => {
  const response = await request(API_ENDPOINT)
    .get('/employee/employee-movement')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));

  return response.body.data.map(
    (employeeMovement: EmployeeMovement) => employeeMovement.id
  );
};
