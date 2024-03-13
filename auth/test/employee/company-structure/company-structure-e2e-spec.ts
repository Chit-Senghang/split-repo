import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';
import { createComponent } from '../company-structure-component/company-structure-component-e2e-service';
import { CompanyStructureTypeEnum } from '../../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';
import { companyStructureData } from './company-structure-sample-data';

export interface ICreateCompanyStructureDto {
  item?: any;
  parentId: number;
  type: CompanyStructureTypeEnum;
  isHq?: boolean;
  fingerprintDeviceId?: number;
  positionLevelId?: number;
}

describe('Company structure Test', () => {
  let accessToken: string;
  let haveCompany: boolean;
  beforeAll(async () => {
    accessToken = await getAccessToken();
    const company = await request(API_ENDPOINT)
      .get('/employee/company-structure?type=COMPANY')
      .set(AUTHORIZATION_KEY, accessToken);

    if (company.body?.data?.length) {
      haveCompany = true;
    }
  });
  it('Test create company structure', async () => {
    if (!haveCompany) {
      // company & location
      const companyStructureComponentId = await createComponent(
        companyStructureData.name,
        CompanyStructureTypeEnum.COMPANY
      );

      const response = await request(API_ENDPOINT)
        .post('/employee/company-structure')
        .send({
          companyStructureComponentId,
          description: 'For Company'
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).not.toBeNull();
        })
        .expect(HttpStatus.CREATED);

      await request(API_ENDPOINT)
        .post('/employee/company-structure')
        .send({
          companyStructureComponentId,
          description: 'For Company'
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((err) => {
          const errorResponse = JSON.parse(err.text);
          expect(errorResponse.errors[0].message).toEqual(
            `You can create only one company`
          );
        })
        .expect(HttpStatus.CONFLICT);

      const structureCompanyId: number = response.body.data.id;
      await traversalTree(structureCompanyId, companyStructureData.child);
    }
  });

  it('Test find all company structure', async () => {
    accessToken = await getAccessToken();
    await request(API_ENDPOINT)
      .get('/employee/company-structure?limit=10')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);
  });

  it('Test each type of company structure', async () => {
    if (!haveCompany) {
      //get one company
      const company = await getAllEachTypeofCompany(
        CompanyStructureTypeEnum.COMPANY
      );
      await getOneOfCompanyStructureById(company.id);

      //get one location
      const location = await getAllEachTypeofCompany(
        CompanyStructureTypeEnum.LOCATION
      );
      await getOneOfCompanyStructureById(location.id);

      //get one outlet
      const outlet = await getAllEachTypeofCompany(
        CompanyStructureTypeEnum.OUTLET
      );
      await getOneOfCompanyStructureById(outlet.id);

      //get one department
      const department = await getAllEachTypeofCompany(
        CompanyStructureTypeEnum.DEPARTMENT
      );
      await getOneOfCompanyStructureById(department.id);

      //get one team
      const team = await getAllEachTypeofCompany(CompanyStructureTypeEnum.TEAM);
      await getOneOfCompanyStructureById(team.id);

      //get one position
      const position = await getAllEachTypeofCompany(
        CompanyStructureTypeEnum.POSITION
      );

      await getOneOfCompanyStructureById(position.id);
    }
  });

  it('Test duplicate department to store', async () => {
    if (!haveCompany) {
      const outlet = await getAllEachTypeofCompany(
        CompanyStructureTypeEnum.OUTLET
      );

      const department = await getAllEachTypeofCompany(
        CompanyStructureTypeEnum.DEPARTMENT
      );

      const response = await request(API_ENDPOINT)
        .post(
          `/employee/company-structure/department/${department.id}/duplicate`
        )
        .send({
          isIncluded: true,
          companyStructureStoreIds: [outlet.id]
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).not.toBeNull();
        })
        .expect(HttpStatus.CREATED);

      await getOneOfCompanyStructureById(response.body.data.id);
    }
  });

  it('Test create position with the same level in the same team', async () => {
    if (!haveCompany) {
      const department = await request(API_ENDPOINT)
        .get(
          `/employee/company-structure?type=${CompanyStructureTypeEnum.DEPARTMENT}`
        )
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(1);
        })
        .expect(HttpStatus.OK);

      const teamName = uuidv4();
      const teamResponseId = await createComponent(
        teamName,
        CompanyStructureTypeEnum.TEAM
      );

      // create new team to test because old team already have all position level
      const teamResponseData = await request(API_ENDPOINT)
        .post('/employee/company-structure')
        .send({
          companyStructureComponentId: teamResponseId,
          parentId: department.body.data[0].id
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).not.toBeNull();
        })
        .expect(HttpStatus.CREATED);

      const name = uuidv4();
      const companyStructureComponentId = await createComponent(
        name,
        CompanyStructureTypeEnum.POSITION
      );

      const positionLevel = await request(API_ENDPOINT)
        .get(`/employee/position-level?limit=10`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(1);
        });

      const response = await request(API_ENDPOINT)
        .post('/employee/company-structure')
        .send({
          companyStructureComponentId,
          parentId: teamResponseData.body.data.id,
          positionLevelId: positionLevel.body.data[0].id,
          description: 'For Company'
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).not.toBeNull();
        })
        .expect(HttpStatus.CREATED);

      //create duplicate position level in the same team
      await request(API_ENDPOINT)
        .post('/employee/company-structure')
        .send({
          companyStructureComponentId,
          parentId: teamResponseData.body.data.id,
          positionLevelId: positionLevel.body.data[0].id,
          description: 'For Company'
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((err) => {
          const errorResponse = JSON.parse(err.text);
          expect(errorResponse.errors[0].message).toEqual(
            `Position level already exist in this division`
          );
        })
        .expect(HttpStatus.CONFLICT);

      //update
      await request(API_ENDPOINT)
        .patch(`/employee/company-structure/${response.body.data.id}`)
        .send({
          description: 'This is new position',
          positionLevelId: positionLevel.body.data[1].id
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.data.id).toEqual(response.body.data.id);
        })
        .expect(HttpStatus.OK);

      //delete
      await request(API_ENDPOINT)
        .delete(`/employee/company-structure/${response.body.data.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.NO_CONTENT);

      // get one after delete
      await request(API_ENDPOINT)
        .get(`/employee/company-structure/${response.body.data.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.NOT_FOUND);
    }
  });

  const traversalTree = async (companyStructureId: number, children: any) => {
    if (children && children.length) {
      for (const item of children) {
        let responseDto: any;
        switch (item.type) {
          case CompanyStructureTypeEnum.LOCATION: {
            responseDto = await createCompanyStructure({
              item,
              parentId: companyStructureId,
              type: CompanyStructureTypeEnum.LOCATION
            });

            if (item.child && item.child.length > 0) {
              await traversalTree(responseDto.body.data.id, item.child);
            }
            break;
          }
          case CompanyStructureTypeEnum.OUTLET: {
            //create fingerPrint device
            const modelName = 'IG-TECH';
            const fingerPrintDeviceId = await request(API_ENDPOINT)
              .post('/employee/finger-print-device')
              .send({
                ipAddress: item.ipAddress,
                specification: 'finger print device',
                description: 'this is finger print device',
                modelName: modelName,
                port: 3827
              })
              .set(AUTHORIZATION_KEY, accessToken)
              .expect((res) => {
                expect(res.body.data.id).not.toBeNull();
              })
              .expect(HttpStatus.CREATED);

            //create company structure outlet
            responseDto = await createCompanyStructure({
              item,
              parentId: companyStructureId,
              type: CompanyStructureTypeEnum.OUTLET,
              isHq: item.isHq || null,
              fingerprintDeviceId: fingerPrintDeviceId.body.data.id
            });

            if (item.child && item.child.length > 0) {
              await traversalTree(responseDto.body.data.id, item.child);
            }
            break;
          }
          case CompanyStructureTypeEnum.DEPARTMENT: {
            responseDto = await createCompanyStructure({
              item,
              parentId: companyStructureId,
              type: CompanyStructureTypeEnum.DEPARTMENT
            });

            if (item.child && item.child.length > 0) {
              await traversalTree(responseDto.body.data.id, item.child);
            }
            break;
          }
          case CompanyStructureTypeEnum.TEAM: {
            responseDto = await createCompanyStructure({
              item,
              parentId: companyStructureId,
              type: CompanyStructureTypeEnum.TEAM
            });
            if (item.positions && item.positions.length > 0) {
              await traversalTree(responseDto.body.data.id, item.positions);
            }
            if (item.child && item.child.length > 0) {
              await traversalTree(responseDto.body.data.id, item.child);
            }
            break;
          }
          case CompanyStructureTypeEnum.POSITION: {
            const positionLevel = await request(API_ENDPOINT)
              .get(
                `/employee/position-level?levelNumber=${item.levelNumber}&limit=1`
              )
              .set(AUTHORIZATION_KEY, accessToken)
              .expect((res) => {
                expect(res.body.data.length).toEqual(1);
              });
            await createCompanyStructure({
              item,
              parentId: companyStructureId,
              type: CompanyStructureTypeEnum.POSITION,
              positionLevelId: positionLevel.body.data[0].id
            });
            break;
          }
          default:
            break;
        }
      }
    }
  };

  const createCompanyStructure = async (
    createCompanyStructureDto: ICreateCompanyStructureDto
  ) => {
    const companyStructureComponentId = await createComponent(
      createCompanyStructureDto.item.name,
      createCompanyStructureDto.type
    );

    const response = await request(API_ENDPOINT)
      .post('/employee/company-structure')
      .send({
        companyStructureComponentId,
        parentId: createCompanyStructureDto.parentId,
        isHq: createCompanyStructureDto.isHq || null,
        fingerprintDeviceId:
          createCompanyStructureDto.fingerprintDeviceId || null,
        positionLevelId: createCompanyStructureDto.positionLevelId || null
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    return response;
  };

  const getAllEachTypeofCompany = async (type: CompanyStructureTypeEnum) => {
    const response = await request(API_ENDPOINT)
      .get(`/employee/company-structure?type=${type}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data[0]).not.toBeNull();
      })
      .expect(HttpStatus.OK);

    return response.body.data[0];
  };

  const getOneOfCompanyStructureById = async (id: number) => {
    await request(API_ENDPOINT)
      .get(`/employee/company-structure/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.OK);
  };
});
