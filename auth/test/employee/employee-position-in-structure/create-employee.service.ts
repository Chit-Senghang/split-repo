import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { WorkShiftTypeEnum } from '../../../apps/employee/src/workshift-type/common/ts/enum/workshift-type.enum';
import { WorkshiftType } from '../../../apps/employee/src/workshift-type/entities/workshift-type.entity';
import { dayJs } from '../../../apps/shared-resources/common/utils/date-utils';
import {
  getRandomNumberFaker,
  getRandomPhoneFaker
} from '../../../test/common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from './../../environment';

const createEmployee = async (
  companyStructurePositionId: number,
  accessToken: string,
  startDate?: string
) => {
  const random = getRandomNumberFaker();
  const today: string = startDate ?? dayJs().format('YYYY-MM-DD');
  const now = dayJs().format('HH:mm');
  const randomPhone = getRandomPhoneFaker();
  let gender: any;
  let workingShift: any;
  let nationality: any;
  let province: any;
  let district: any;
  let commune: any;
  let village: any;
  let maritalStatus: any;
  let spouse: any;
  let documentType: any;
  let educationType: any;
  let paymentMethod: any;
  let insurance: any;
  let language: any;
  let skill: any;
  let training: any;
  let vaccination: any;

  await getGender();
  await getWorkingShift();
  await getNationality();
  await getProvince();
  await getDistrict();
  await getCommune();
  await getVillage();
  await getMaritalStatus();
  await getSpouse();
  await getDocumentType();
  await getEducationType();
  // await getPosition();
  await getPaymentMethod();
  await getInsurance();
  await getLanguage();
  await getSkill();
  await getTraining();
  await getVaccination();

  async function getGender(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=GENDER')
      .set(AUTHORIZATION_KEY, accessToken);
    gender = response.body.data.find((gender: any) => gender.isSystemDefined);
  }

  async function getWorkingShift(): Promise<void> {
    const workingShiftTypeResponse = await request(API_ENDPOINT)
      .get('/employee/workshift-type')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.length).not.toBeNull());

    const workshiftType = workingShiftTypeResponse.body.data.find(
      (workingShiftType: WorkshiftType) =>
        workingShiftType.name === WorkShiftTypeEnum.ROSTER
    );

    if (workshiftType) {
      const data = {
        name: random,
        endScanTimePartOne: now,
        endWorkingTime: now,
        scanType: 'FOUR_TIMES',
        startScanTimePartOne: now,
        breakTime: 0,
        startWorkingTime: now,
        workshiftTypeId: workshiftType.id,
        workOnWeekend: false,
        weekendScanTime: now
      };
      const response = await request(API_ENDPOINT)
        .post('/employee/working-shift')
        .send(data)
        .set(AUTHORIZATION_KEY, accessToken);
      workingShift = response.body.data;
    }
  }

  async function getNationality(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=NATIONALITY&limit=500')
      .set(AUTHORIZATION_KEY, accessToken);
    nationality = response.body.data.find(
      (nationality: any) => nationality.identifier === 'Cambodian'
    );
  }

  async function getProvince(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/geographic?geographicType=PROVINCE')
      .set(AUTHORIZATION_KEY, accessToken);
    province = response.body.data.find((province: any) => province);
  }

  async function getDistrict(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get(
        `/employee/geographic/list/tree?parentId=${province.id}&geographicType=DISTRICT`
      )
      .set(AUTHORIZATION_KEY, accessToken);
    district = response.body.data.find((district: any) => district);
  }

  async function getCommune(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get(
        `/employee/geographic/list/tree?parentId=${district.id}&geographicType=COMMUNE`
      )
      .set(AUTHORIZATION_KEY, accessToken);
    commune = response.body.data.find((commune: any) => commune);
  }

  async function getVillage(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get(
        `/employee/geographic/list/tree?parentId=${commune.id}&geographicType=VILLAGE`
      )
      .set(AUTHORIZATION_KEY, accessToken);
    village = response.body.data.find((village: any) => village);
  }

  async function getMaritalStatus(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=MARITAL_STATUS')
      .set(AUTHORIZATION_KEY, accessToken);
    maritalStatus = response.body.data.find(
      (maritalStatus: any) =>
        maritalStatus.isSystemDefined && maritalStatus.value === 'Married'
    );
  }

  async function getSpouse(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=RELATIONSHIP')
      .set(AUTHORIZATION_KEY, accessToken);
    spouse = response.body.data.find((spouse: any) => spouse.isSystemDefined);
  }

  async function getDocumentType(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=DOCUMENT_TYPE')
      .set(AUTHORIZATION_KEY, accessToken);
    documentType = response.body.data.find(
      (documentType: any) => documentType.isSystemDefined
    );
  }

  async function getEducationType(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=EDUCATION_TYPE')
      .set(AUTHORIZATION_KEY, accessToken);
    educationType = response.body.data.find(
      (educationType: any) => educationType.isSystemDefined
    );
  }

  async function getLanguage(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=LANGUAGE')
      .set(AUTHORIZATION_KEY, accessToken);
    language = response.body.data.find(
      (language: any) => language.isSystemDefined
    );
  }

  async function getSkill(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=SKILL')
      .set(AUTHORIZATION_KEY, accessToken);
    skill = response.body.data.find((skill: any) => skill.isSystemDefined);
  }

  async function getTraining(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=TRAINING')
      .set(AUTHORIZATION_KEY, accessToken);
    training = response.body.data.find(
      (training: any) => training.isSystemDefined
    );
  }

  async function getVaccination(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .post('/employee/vaccination')
      .send({ name: random })
      .set(AUTHORIZATION_KEY, accessToken);
    vaccination = response.body.data;
  }

  async function getInsurance(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .post('/employee/insurance')
      .send({ name: random })
      .set(AUTHORIZATION_KEY, accessToken);
    insurance = response.body.data;
  }

  async function getPaymentMethod(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .post('/employee/payment-method')
      .send({ name: random })
      .set(AUTHORIZATION_KEY, accessToken);
    paymentMethod = response.body.data;
  }

  const data = {
    accountNo: random,
    fingerPrintId: random,
    employmentStatus: 'LOCAL',
    firstNameEn: random,
    lastNameEn: random,
    firstNameKh: random,
    lastNameKh: random,
    genderId: gender.id,
    startDate: today,
    postProbationDate: today,
    contractType: 'UDC_24',
    contractPeriodStartDate: today,
    contractPeriodEndDate: today,
    employmentType: 'FULL_TIME',
    workingShiftId: workingShift?.id,
    dob: today,
    placeOfBirthId: province.id,
    nationality: nationality.id,
    email: `${random}@gmail.com`,
    maritalStatusId: maritalStatus?.id,
    spouseId: spouse.id,
    addressHomeNumber: random,
    addressVillageId: village?.id,
    addressProvinceId: province?.id,
    addressDistrictId: district?.id,
    addressCommuneId: commune?.id,
    taxResponsible: 'INDIVIDUAL',
    addressStreetNumber: random,
    contacts: [
      {
        isDefault: true,
        contact: randomPhone
      }
    ],
    emergencyContacts: [
      {
        contact: randomPhone,
        contactRelationshipId: spouse?.id
      }
    ],
    identifiers: [
      {
        documentTypeId: documentType?.id,
        documentIdentifier: random,
        description: random,
        expireDate: today
      }
    ],
    educations: [
      {
        educationTypeId: educationType?.id,
        instituteName: random,
        major: random,
        startDate: today,
        endDate: today
      }
    ],
    positions: [
      {
        positionId: companyStructurePositionId,
        isDefaultPosition: true
      }
    ],
    paymentMethodAccounts: [
      {
        paymentMethodId: paymentMethod?.id,
        accountNumber: random,
        isDefaultAccount: true
      }
    ],
    insuranceCards: [
      {
        insuranceId: insurance?.id,
        cardNumber: random
      }
    ],
    languages: [language.id],
    skills: [skill.id],
    trainings: [training.id],
    vaccinationCards: [
      {
        vaccinationId: vaccination?.id,
        cardNumber: random
      }
    ]
  };
  // create
  data.accountNo = random;
  const response = await request(API_ENDPOINT)
    .post('/employee/employee-master-information')
    .send(data)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data?.id).not.toBeUndefined();
      expect(res.body.data.id).not.toBeNull();
    });

  const employeeId = response.body.data.id;
  await request(API_ENDPOINT)
    .get(`/employee/employee-master-information/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => expect(res.body.data.startDate).toEqual(today));

  return employeeId;
};

export { createEmployee };
