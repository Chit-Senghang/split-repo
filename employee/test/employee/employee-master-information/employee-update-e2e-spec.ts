import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MediaEntityTypeEnum } from '../../../apps/employee/src/media/common/ts/enums/entity-type.enum';
import { EmployeeContact } from '../../../apps/employee/src/employee-contact/entities/employee-contact.entity';
import { User } from '../../../apps/authentication/src/user/entities/user.entity';
import { EmployeeVaccination } from '../../../apps/employee/src/employee-vaccination/entities/employee-vaccination.entity';
import { EmployeeEducation } from '../../../apps/employee/src/employee-education/entities/employee-education.entity';
import { EmployeeInsurance } from '../../../apps/employee/src/employee-insurance/entities/employee-insurance.entity';
import { EmployeePaymentMethodAccount } from '../../../apps/employee/src/employee-payment-method-account/entities/employee-payment-method-account.entity';
import { EmployeeIdentifier } from '../../../apps/employee/src/employee-identifier/entities/employee-identifier.entity';
import { EmployeeEmergencyContact } from '../../../apps/employee/src/employee-emergency-contact/entities/employee-emergency-contact.entity';
import {
  LanguageDto,
  SkillDto,
  TrainingDto,
  UpdateEmployeeDto
} from '../../../apps/employee/src/employee/dto/update-employee.dto';
import { CreateEmployeeIdentifierDto } from '../../../apps/employee/src/employee-identifier/dto/create-employee-identifier.dto';
import { CreateEmployeePaymentMethodAccountDto } from '../../../apps/employee/src/employee-payment-method-account/dto/create-employee-payment-method-account.dto';
import { CreateEmployeeInsuranceDto } from '../../../apps/employee/src/employee-insurance/dto/create-employee-insurance.dto';
import { CreateEmployeeVaccinationDto } from '../../../apps/employee/src/employee-vaccination/dto/create-employee-vaccination.dto';
import { CreateEmployeeEducationDto } from '../../../apps/employee/src/employee-education/dto/create-employee-education.dto';
import { EmployeeLanguage } from '../../../apps/employee/src/employee-language/entities/employee-language.entity';
import { EmployeeTraining } from '../../../apps/employee/src/employee-training/entities/employee-training.entity';
import { EmployeeSkill } from '../../../apps/employee/src/employee-skill/entities/employee-skill.entity';
import { Employee } from '../../../apps/employee/src/employee/entity/employee.entity';
import { ApprovalStatusEnum } from '../../../apps/employee/src/approval-status-tracking/common/ts/enum/approval-status.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { CreateEmployeeContactDto } from '../../../apps/employee/src/employee-contact/dto/create-employee-contact.dto';
import {
  getAccessToken,
  getRandomPhoneFaker,
  getRandomString
} from '../../../test/common/common.e2e.service';
import { employeeWorkflowOnSetService } from '../workflow/employee-workflow-one-set.service';
import { CreateEmployeeEmergencyContactDto } from './../../../apps/employee/src/employee-emergency-contact/dto/create-employee-emergency-contact.dto';

describe('Test Update Employee', () => {
  let accessToken: string;
  let accountNo: string;
  let name: string;
  let userId: number;
  beforeAll(async () => {
    accountNo = getRandomString(10);
    name = uuidv4();
    accessToken = await getAccessToken();
    const user: User = await getCurrentUser(accessToken);
    userId = user.id;
  });

  it('Update Employee', async () => {
    const workflowOneSetInfo = await employeeWorkflowOnSetService(
      accessToken,
      false,
      true,
      MediaEntityTypeEnum.EMPLOYEE_INFO_UPDATE
    );

    //HEAD: to check get with no permission
    const headAccessToken: string = workflowOneSetInfo.headEmployee.AccessToken;

    //MANAGER as first approver
    const approverAccessToken: string =
      workflowOneSetInfo.managerEmployee.AccessToken;

    //OFFICER as requester
    const employeeId = workflowOneSetInfo.officerEmployee.id;
    const employeeAccessToken = workflowOneSetInfo.officerEmployee.AccessToken;

    //GET: employee
    const employee = await getEmployeeAfterUpdate(
      accessToken,
      employeeId,
      userId
    );

    const updateEmployeeDto: UpdateEmployeeDto = {
      startDate: employee.startDate.toString(),
      accountNo: `EMP${accountNo}`,
      fingerPrintId: accountNo,
      firstNameEn: name,
      lastNameEn: name,
      firstNameKh: name,
      lastNameKh: name,
      contacts: [
        ...employee.contacts,
        {
          contact: getRandomPhoneFaker(),
          isDefault: false
        }
      ] as CreateEmployeeContactDto[],
      genderId: employee.gender.id,
      maritalStatusId: employee.maritalStatus.id,
      languages: [
        ...employee.languages.map((language: EmployeeLanguage) => {
          return { id: language.id, languageId: language.languageId.id };
        })
      ] as LanguageDto[],
      trainings: [
        ...employee.trainings.map((training: EmployeeTraining) => {
          return { id: training.id, trainingId: training.trainingId.id };
        })
      ] as TrainingDto[],
      skills: [
        ...employee.skills.map((skill: EmployeeSkill) => {
          return { id: skill.id, skillId: skill.skillId.id };
        })
      ] as SkillDto[],
      workingShiftId: employee.workingShiftId.id,
      placeOfBirthId: employee.placeOfBirthId.id,
      nationality: employee.nationality.id,
      spouseId: employee.spouseId.id,
      addressVillageId: employee.addressVillageId.id,
      addressProvinceId: employee.addressProvinceId.id,
      addressDistrictId: employee.addressDistrictId.id,
      addressCommuneId: employee.addressCommuneId.id,
      emergencyContacts: [
        ...employee.emergencyContacts.map(
          (emergencyContact: EmployeeEmergencyContact) => {
            return {
              id: emergencyContact.id,
              contact: emergencyContact.contact,
              contactRelationshipId: emergencyContact.contactRelationship.id
            };
          }
        )
      ] as CreateEmployeeEmergencyContactDto[],
      identifiers: [
        ...employee.identifiers.map((identifier: EmployeeIdentifier) => {
          return {
            id: identifier.id,
            documentTypeId: identifier.documentTypeId.id,
            documentIdentifier: identifier.documentIdentifier,
            expireDate: identifier.expireDate,
            description: identifier.description
          };
        })
      ] as CreateEmployeeIdentifierDto[],
      paymentMethodAccounts: [
        ...employee.paymentMethodAccounts.map(
          (payment: EmployeePaymentMethodAccount) => {
            return {
              paymentMethodId: payment.paymentMethod.id,
              accountNumber: payment.accountNumber,
              isDefaultAccount: payment.isDefaultAccount,
              id: payment.id
            };
          }
        )
      ] as CreateEmployeePaymentMethodAccountDto[],
      insuranceCards: [
        ...employee.insuranceCards.map((insuranceCard: EmployeeInsurance) => {
          return {
            id: insuranceCard.id,
            cardNumber: insuranceCard.cardNumber,
            insuranceId: insuranceCard.insuranceId.id
          };
        })
      ] as CreateEmployeeInsuranceDto[],
      vaccinationCards: [
        ...employee.vaccinationCards.map((vaccination: EmployeeVaccination) => {
          return {
            id: vaccination.id,
            cardNumber: vaccination.cardNumber,
            vaccinationId: vaccination.vaccinationId.id
          };
        })
      ] as CreateEmployeeVaccinationDto[],
      educations: [
        ...employee.educations.map((education: EmployeeEducation) => {
          return {
            id: education.id,
            educationTypeId: education.educationTypeId.id,
            instituteName: education.instituteName,
            major: education.major,
            startDate: education.startDate.toString(),
            endDate: education.endDate.toString()
          };
        })
      ] as CreateEmployeeEducationDto[],
      employmentStatus: employee.employmentStatus,
      postProbationDate: employee.postProbationDate.toString(),
      contractType: employee.contractType,
      contractPeriodStartDate: employee.contractPeriodStartDate.toString(),
      contractPeriodEndDate: employee.contractPeriodEndDate.toString(),
      employmentType: employee.employmentType,
      dob: employee.dob.toString(),
      email: employee.email,
      spouseOccupation: employee.spouseOccupation,
      numberOfChildren: employee.numberOfChildren,
      addressHomeNumber: employee.addressHomeNumber,
      addressStreetNumber: employee.addressStreetNumber,
      taxResponsible: employee.taxResponsible,
      positions: []
    };

    //UPDATE: employee information
    await updateEmployee(employeeAccessToken, employee, updateEmployeeDto);

    //REQUEST: update employee again; expect error because employee has to cancel previous PENDING request first
    await updateEmployee(
      employeeAccessToken,
      employee,
      updateEmployeeDto,
      true
    );

    //CANCEL: employee update
    await cancelEmployeeUpdate(employeeAccessToken, employeeId, false);

    //CANCEL: again; expect error because no PENDING request
    await cancelEmployeeUpdate(employeeAccessToken, employeeId, true);

    //UPDATE: employee again by own employee; expect createdBy = admin
    await updateEmployee(employeeAccessToken, employee, updateEmployeeDto);

    //GET ALL: by HEAD user; expect not found because not match workflow
    await request(API_ENDPOINT)
      .get(
        `/employee/approval-status-tracking?entityId=${employeeId}&employeeId=${employeeId}`
      )
      .set(AUTHORIZATION_KEY, headAccessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.length).toEqual(0));

    //APPROVE: by first approver
    await approveOrAcknowledge(approverAccessToken, employeeId);

    //GET: one after update and approve
    await getEmployeeAfterUpdate(
      accessToken,
      employeeId,
      userId,
      updateEmployeeDto
    );
  });
});

const cancelEmployeeUpdate = async (
  accessToken: string,
  employeeId: number,
  expectError: boolean
) => {
  await request(API_ENDPOINT)
    .patch(`/employee/employee-master-information/cancel/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(expectError ? HttpStatus.NOT_FOUND : HttpStatus.OK)
    .expect(async (res) => {
      if (!expectError) {
        const approvalStatus = await getUpdateEmployeeApprovalStatus(
          employeeId,
          accessToken,
          ApprovalStatusEnum.CANCEL
        );
        expect(res.body.data.id).toEqual(approvalStatus.id);
      } else {
        expect(res.body.errors.at(0).message).toEqual(
          `Resource approval status of employee ${employeeId} not found.`
        );
      }
    });
};

const getEmployeeAfterUpdate = async (
  accessToken: string,
  employeeId: number,
  adminUserId: number,
  updateEmployeeDto?: UpdateEmployeeDto
): Promise<Employee> => {
  //GET: employee after update
  const response = await request(API_ENDPOINT)
    .get(`/employee/employee-master-information/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      //Admin token and get user admin
      expect(res.body.data.id).toEqual(employeeId);
      expect(res.body.data.createdBy).toEqual(adminUserId);
      if (updateEmployeeDto) {
        const getUpdatedContact = updateEmployeeDto.contacts.find(
          (contact: CreateEmployeeContactDto) => !contact.isDefault
        );

        expect(res.body.data.accountNo).toEqual(updateEmployeeDto.accountNo);
        expect(res.body.data.fingerPrintId).toEqual(
          updateEmployeeDto.fingerPrintId
        );
        expect(res.body.data.firstNameKh).toEqual(
          updateEmployeeDto.firstNameKh
        );
        expect(res.body.data.lastNameKh).toEqual(updateEmployeeDto.lastNameKh);
        expect(res.body.data.firstNameEn).toEqual(
          updateEmployeeDto.firstNameEn
        );
        expect(res.body.data.lastNameEn).toEqual(updateEmployeeDto.lastNameEn);

        //Expect updated contact number
        expect(getContact(res.body.data.contacts).contact).toEqual(
          getUpdatedContact.contact
        );
        expect(getContact(res.body.data.contacts).isDefault).toEqual(
          getUpdatedContact.isDefault
        );
      }
    });
  return response.body.data;
};

const updateEmployee = async (
  accessToken: string,
  employee: Employee,
  updateEmployeeDto: UpdateEmployeeDto,
  expectError = false
) => {
  //UPDATE: employee
  await request(API_ENDPOINT)
    .patch(`/employee/employee-master-information/${employee.id}`)
    .send(updateEmployeeDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      if (expectError) {
        expect(res.body.errors.at(0).message).toEqual(
          'Employee has already requested to update the information. Please cancel the pending record to re-update again.'
        );
      }
    })
    .expect(expectError ? HttpStatus.BAD_REQUEST : HttpStatus.OK);
};

const getUpdateEmployeeApprovalStatus = async (
  employeeId: number,
  accessToken: string,
  status: ApprovalStatusEnum
) => {
  const approvalStatus = await request(API_ENDPOINT)
    .get(
      `/employee/approval-status-tracking/entity/${employeeId}/entityType/${MediaEntityTypeEnum.EMPLOYEE_INFO_UPDATE}?status=${status}`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.id).toBeGreaterThan(0);
    });
  return approvalStatus.body.data;
};

const approveOrAcknowledge = async (
  accessToken: string,
  employeeId: number
): Promise<void> => {
  const approvalStatus = await getUpdateEmployeeApprovalStatus(
    employeeId,
    accessToken,
    ApprovalStatusEnum.PENDING
  );
  await request(API_ENDPOINT)
    .patch(`/employee/approval-status-tracking/${approvalStatus.id}`)
    .send({ approvalResult: true, reason: 'From Test' })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).toEqual(approvalStatus.id);
    })
    .expect(HttpStatus.OK);
};

const getCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await request(API_ENDPOINT)
    .get(`/authentication/user/current`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK);
  return response.body.data;
};

const getContact = (contacts: EmployeeContact[]): EmployeeContact => {
  return contacts.find((contact: EmployeeContact) => !contact.isDefault);
};
