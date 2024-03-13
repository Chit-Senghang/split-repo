import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { CompanyStructureTypeEnum } from '../../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';
import { dayJs } from '../../../apps/shared-resources/common/utils/date-utils';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import {
  createCompanyStructureTree,
  getAccessToken,
  getPositionLevelByName,
  getRandomDateFaker,
  getRandomEmailFaker,
  getRandomNumberFaker,
  getRandomPhoneFaker,
  getRandomString
} from '../../common/common.e2e.service';
import { getWorkshiftTypeByName } from '../workshift-type/workshift-type.e2e-service';
import { WorkShiftTypeEnum } from '../../../apps/employee/src/workshift-type/common/ts/enum/workshift-type.enum';
import { PositionLevelTitleEnum } from './../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';

let getEmployeeId: number;
describe('EmployeeMasterInformationTest', () => {
  const random = getRandomNumberFaker();
  const accountNumber = getRandomNumberFaker();
  const phoneRandom = getRandomPhoneFaker();
  const randomDate = getRandomDateFaker();
  const randomString = getRandomString();
  const now = dayJs().format('HH:mm');
  let accessToken: string,
    gender: any,
    workingShift: any,
    nationality: any,
    province: any,
    district: any,
    commune: any,
    village: any,
    maritalStatus: any,
    spouse: any,
    documentType: any,
    educationType: any,
    position: any,
    paymentMethod: any,
    paymentMethodCashId: any,
    insurance: any,
    language: any,
    skill: any,
    training: any,
    vaccination: any;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    const officerPositionLevel = await getPositionLevelByName(
      PositionLevelTitleEnum.OFFICER,
      accessToken
    );
    await createCompanyStructureTree(officerPositionLevel.id, accessToken);
    await getPaymentMethodWithName();
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
    await getPosition();
    await getPaymentMethod();
    await getInsurance();
    await getLanguage();
    await getSkill();
    await getTraining();
    await getVaccination();
  });

  async function getGender(): Promise<void> {
    const response = await request(API_ENDPOINT)
      .get('/employee/code-value?code=GENDER')
      .set(AUTHORIZATION_KEY, accessToken);
    gender = response.body.data.find((gender: any) => gender.isSystemDefined);
  }

  const getPaymentMethodWithName = async () => {
    const responseWithCash = await request(API_ENDPOINT)
      .get('/employee/payment-method?keywords=CASH')
      .set(AUTHORIZATION_KEY, accessToken);
    paymentMethodCashId = responseWithCash.body.data.find(
      (paymentMethod: any) => (paymentMethod.name = 'CASH')
    );
  };

  async function getWorkingShift(): Promise<void> {
    const workingShiftTypeResponse = await request(API_ENDPOINT)
      .get('/employee/workshift-type')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);

    const data = {
      name: random,
      endScanTimePartOne: now,
      endWorkingTime: now,
      scanType: 'FOUR_TIMES',
      startScanTimePartOne: now,
      breakTime: 0,
      startWorkingTime: now,
      workshiftTypeId: workingShiftTypeResponse.body.data[0].id,
      workOnWeekend: false,
      weekendScanTime: now
    };
    const response = await request(API_ENDPOINT)
      .post('/employee/working-shift')
      .send(data)
      .set(AUTHORIZATION_KEY, accessToken);
    workingShift = response.body.data;
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

  async function getPosition(): Promise<void> {
    const company = await request(API_ENDPOINT)
      .get('/employee/company-structure/list')
      .set(AUTHORIZATION_KEY, accessToken);
    const department = company.body.data
      .find((company: any) => company)
      .locations.find((location: any) => location.outlets.length)
      .outlets.find((outlet) => outlet.departments.length)
      .departments.find((department: any) => department);
    const division = await request(API_ENDPOINT)
      .get(`/employee/company-structure/department-or-team/${department.id}`)
      .set(AUTHORIZATION_KEY, accessToken);
    const response = await request(API_ENDPOINT)
      .get(
        `/employee/company-structure/department-or-team/${
          division.body.data.find((division: any) => division).id
        }`
      )
      .set(AUTHORIZATION_KEY, accessToken);
    position = response.body.data.find(
      (structure: any) => structure.type === CompanyStructureTypeEnum.POSITION
    );
  }
  it('Test CRUD', async () => {
    const payloadCreateEmployee = {
      accountNo: accountNumber,
      fingerPrintId: random,
      employmentStatus: 'LOCAL',
      firstNameEn: random,
      lastNameEn: random,
      firstNameKh: random,
      lastNameKh: random,
      genderId: gender.id,
      startDate: randomDate,
      postProbationDate: randomDate,
      contractType: 'UDC_24',
      contractPeriodStartDate: randomDate,
      contractPeriodEndDate: randomDate,
      employmentType: 'PART_TIME',
      workingShiftId: workingShift.id,
      dob: randomDate,
      placeOfBirthId: province.id,
      nationality: nationality.id,
      email: getRandomEmailFaker(),
      maritalStatusId: maritalStatus.id,
      spouseId: spouse.id,
      addressHomeNumber: random,
      addressVillageId: village.id,
      addressProvinceId: province.id,
      addressDistrictId: district.id,
      addressCommuneId: commune.id,
      taxResponsible: 'INDIVIDUAL',
      addressStreetNumber: random,
      contacts: [
        {
          isDefault: true,
          contact: `${phoneRandom}`
        }
      ],
      emergencyContacts: [
        {
          contact: `${phoneRandom}`,
          contactRelationshipId: spouse.id
        }
      ],
      identifiers: [
        {
          documentTypeId: documentType.id,
          documentIdentifier: random,
          description: random,
          expireDate: randomDate
        }
      ],
      educations: [
        {
          educationTypeId: educationType.id,
          instituteName: random,
          major: random,
          startDate: randomDate,
          endDate: randomDate
        }
      ],
      positions: [
        {
          positionId: position.id,
          isDefaultPosition: true
        }
      ],
      paymentMethodAccounts: [
        {
          paymentMethodId: paymentMethod.id,
          accountNumber: random,
          isDefaultAccount: true
        },
        {
          paymentMethodId: paymentMethodCashId.id,
          accountNumber: random,
          isDefaultAccount: false
        }
      ],
      insuranceCards: [
        {
          insuranceId: insurance.id,
          cardNumber: random
        }
      ],
      languages: [language.id],
      skills: [skill.id],
      trainings: [training.id],
      vaccinationCards: [
        {
          vaccinationId: vaccination.id,
          cardNumber: random
        }
      ]
    };
    // test date null validation
    payloadCreateEmployee.startDate = null;
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((error) => {
        const errorResponse = JSON.parse(error.text);
        expect(errorResponse.errors[0].message).toContain(
          `startDate should not be empty`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);
    // test date '' validation
    payloadCreateEmployee.startDate = '';
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((error) => {
        const errorResponse = JSON.parse(error.text);
        expect(errorResponse.errors[0].message).toContain(
          `startDate should not be empty`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    // test name length validation
    payloadCreateEmployee.startDate = randomDate;
    payloadCreateEmployee.firstNameEn = getRandomString(101);
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((error) => {
        const errorResponse = JSON.parse(error.text);
        expect(errorResponse.errors[0].message).toContain(
          `firstNameEn must be shorter than`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    // test account number null validation
    payloadCreateEmployee.firstNameEn = random;
    payloadCreateEmployee.accountNo = null;
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((error) => {
        const errorResponse = JSON.parse(error.text);
        expect(errorResponse.errors[0].message).toEqual(
          `accountNo must be shorter than or equal to 20 characters`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    // test account number blank space validation
    payloadCreateEmployee.accountNo = ` 0 ${accountNumber} 01`;
    payloadCreateEmployee.startDate = randomDate;
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((error) => {
        const errorResponse = JSON.parse(error.text);
        expect(errorResponse.errors[0].message).toEqual(
          `Space are not allowed.`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    // test account number undefined validation
    delete payloadCreateEmployee.accountNo;
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((error) => {
        const errorResponse = JSON.parse(error.text);
        expect(errorResponse.errors[0].message).toEqual(
          `accountNo must be shorter than or equal to 20 characters`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    // test account number length validation
    payloadCreateEmployee.accountNo = `${randomString + randomString}`;
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((error) => {
        const errorResponse = JSON.parse(error.text);
        expect(errorResponse.errors[0].message).toEqual(
          `accountNo must be shorter than or equal to 20 characters`
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    delete payloadCreateEmployee.paymentMethodAccounts[1].accountNumber;
    payloadCreateEmployee.accountNo = accountNumber;
    const response = await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data?.id).not.toBeUndefined();
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // create duplicate
    await request(API_ENDPOINT)
      .post('/employee/employee-master-information')
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);

    const id: number = response.body.data.id;
    getEmployeeId = id;
    // get one
    await request(API_ENDPOINT)
      .get(`/employee/employee-master-information/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          accountNo: `EMP${accountNumber}`
        });
        expect(res.body.data).toMatchObject({ fingerPrintId: `${random}` });
      })
      .expect(HttpStatus.OK);

    // update
    delete payloadCreateEmployee.emergencyContacts;
    delete payloadCreateEmployee.identifiers;
    delete payloadCreateEmployee.educations;
    delete payloadCreateEmployee.insuranceCards;
    delete payloadCreateEmployee.vaccinationCards;
    delete payloadCreateEmployee.languages;
    delete payloadCreateEmployee.skills;
    delete payloadCreateEmployee.trainings;
    payloadCreateEmployee.accountNo = `EMP${accountNumber}`;
    await request(API_ENDPOINT)
      .patch(`/employee/employee-master-information/${id}`)
      .send(payloadCreateEmployee)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/employee-master-information/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          accountNo: `EMP${accountNumber}`
        });
      })
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/employee-master-information?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);
  });
  it('For demo workshift', async () => {
    accessToken = await getAccessToken();
    const nameNormalStaff = `Normal Staff (Mon-Sat)`;
    const nameRosterFullTime = `Roster Full  Time`;
    const nameRosterPartTimeA = `Roster Part Time A`;
    const nameRosterPartTimeB = `Roster Part Time B`;

    const rosterWorkshiftType = await getWorkshiftTypeByName(
      accessToken,
      WorkShiftTypeEnum.ROSTER
    );

    const normalWorkshiftType = await getWorkshiftTypeByName(
      accessToken,
      WorkShiftTypeEnum.NORMAL
    );

    let payload: any = {
      name: nameNormalStaff,
      workshiftTypeId: normalWorkshiftType.id,
      startWorkingTime: '08:00',
      endWorkingTime: '17:00',
      startScanTimePartOne: '08:00',
      endScanTimePartOne: '17:00',
      scanType: 'TWO_TIMES',
      workOnWeekend: true,
      weekendScanTime: '12:00',
      breakTime: 60
    };

    await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken);

    payload = {
      name: nameRosterFullTime,
      workshiftTypeId: rosterWorkshiftType.id,
      startWorkingTime: '07:00',
      endWorkingTime: '16:00',
      startScanTimePartOne: '07:00',
      endScanTimePartOne: '16:00',
      scanType: 'FOUR_TIMES',
      breakTime: 60
    };

    await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken);

    payload = {
      name: nameRosterPartTimeA,
      workshiftTypeId: rosterWorkshiftType.id,
      startWorkingTime: '07:00',
      endWorkingTime: '11:00',
      startScanTimePartOne: '07:00',
      endScanTimePartOne: '11:00',
      scanType: 'TWO_TIMES',
      breakTime: 0
    };

    await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken);

    payload = {
      name: nameRosterPartTimeB,
      workshiftTypeId: rosterWorkshiftType.id,
      startWorkingTime: '07:00',
      endWorkingTime: '13:00',
      startScanTimePartOne: '07:00',
      endScanTimePartOne: '13:00',
      scanType: 'FOUR_TIMES',
      breakTime: 30
    };

    await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken);

    payload = {
      name: nameRosterFullTime,
      workshiftTypeId: rosterWorkshiftType.id,
      startWorkingTime: '07:00',
      endWorkingTime: '16:00',
      startScanTimePartOne: '07:00',
      endScanTimePartOne: '16:00',
      scanType: 'FOUR_TIMES',
      breakTime: 60
    };

    await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken);

    payload = {
      name: nameRosterPartTimeA,
      workshiftTypeId: rosterWorkshiftType.id,
      startWorkingTime: '07:00',
      endWorkingTime: '11:00',
      startScanTimePartOne: '07:00',
      endScanTimePartOne: '11:00',
      scanType: 'TWO_TIMES',
      breakTime: 0
    };

    await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken);

    payload = {
      name: nameRosterPartTimeB,
      workshiftTypeId: rosterWorkshiftType.id,
      startWorkingTime: '07:00',
      endWorkingTime: '13:00',
      startScanTimePartOne: '07:00',
      endScanTimePartOne: '13:00',
      scanType: 'FOUR_TIMES',
      breakTime: 30
    };

    await request(API_ENDPOINT)
      .post(`/employee/working-shift`)
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken);
  });
});
export { getEmployeeId };
