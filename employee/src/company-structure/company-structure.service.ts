import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  MoreThan,
  Not,
  QueryRunner,
  Repository
} from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { removeUnnecessaryProps } from '../shared-resources/function/remove-unnecessary-props';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { EmployeeProto } from '../shared-resources/proto';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { Media } from '../media/entities/media.entity';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { FingerprintDevice } from '../finger-print-device/entities/finger-print-device.entity';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { BenefitIncreasementPolicyService } from '../benefit-increasement-policy/benefit-increasement-policy.service';
import { BenefitIncreasementPolicy } from '../benefit-increasement-policy/entities/benefit-increasement-policy.entity';
import { DEFAULT_DATE_TIME_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { EmployeeStatusEnum } from '../employee/enum/employee-status.enum';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { companyStructureConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CompanyStructureConstants } from './common/constants/company-structure.constants';
import { CompanyStructureTypeEnum } from './common/ts/enum/structure-type.enum';
import { CompanyStructureComponent } from './company-structure-component/entities/company-structure-component.entity';
import { CreateCompanyStructureDto } from './dto/create-company-structure.dto';
import { PaginationQueryCompanyStructureDto } from './dto/pagination-company-structure';
import { UpdateCompanyStructureDto } from './dto/update-company-structure.dto';
import {
  CompanyStructure,
  companyStructureSearchableColumns
} from './entities/company-structure.entity';
import { DuplicateCompanyStructureDto } from './dto/duplicate-company-structure.dto';
import { EMPLOYEE_PROFILE_SELECTED_FIELDS } from './common/constants/employee-profile-selected-fields.contant';
import { DUPLICATE_COMPANY_STRUCTURE_DEPARTMENT_SELECTED_FIELDS } from './common/constants/duplicate-company-structure-selected-fields.constant';
import { CompanyStructureTreeDto } from './dto/company-structure-name-tree.dto';

@Injectable()
export class CompanyStructureService {
  private readonly COMPANY_STRUCTURE_COMPONENT = 'company structure component';

  private readonly COMPANY_STRUCTURE = 'company structure';

  private readonly OUTLET = 'outlet';

  constructor(
    @InjectRepository(CompanyStructure)
    private readonly companyStructureRepo: Repository<CompanyStructure>,
    @InjectRepository(PositionLevel)
    private readonly positionLevelRepo: Repository<PositionLevel>,
    @InjectRepository(CompanyStructureComponent)
    private readonly companyStructureComponentRepo: Repository<CompanyStructureComponent>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(FingerprintDevice)
    private readonly fingerprintDeviceRepo: Repository<FingerprintDevice>,
    private readonly dataSource: DataSource,
    private readonly benefitIncreasementPolicyService: BenefitIncreasementPolicyService
  ) {}

  validateCompanyStructureComponentId = async (
    id: number,
    createCompanyStructureDto?: CreateCompanyStructureDto,
    companyStructureId?: number
  ) => {
    const structureComponent = await this.companyStructureComponentRepo.findOne(
      {
        where: {
          id
        }
      }
    );

    if (!structureComponent) {
      throw new ResourceNotFoundException('company structure component', id);
    }

    if (
      structureComponent.type !== CompanyStructureTypeEnum.POSITION &&
      createCompanyStructureDto.postProbationBenefitIncrementPolicyId
    ) {
      throw new ResourceForbiddenException(
        'postProbationBenefitIncreasementId should not be created with other type, besides type of position'
      );
    }

    if (createCompanyStructureDto.postProbationBenefitIncrementPolicyId) {
      await this.benefitIncreasementPolicyService.findOne(
        createCompanyStructureDto.postProbationBenefitIncrementPolicyId
      );
    }

    if (structureComponent.type === CompanyStructureTypeEnum.OUTLET) {
      if (createCompanyStructureDto.isHq) {
        const companyStructure: CompanyStructure =
          await this.companyStructureRepo.findOne({
            where: {
              isHq: true,
              companyStructureComponent: {
                type: CompanyStructureTypeEnum.OUTLET
              }
            },
            relations: { companyStructureComponent: true }
          });

        if (companyStructure) {
          throw new ResourceConflictException(`isHQ`);
        }
      }
    } else if (createCompanyStructureDto.isHq) {
      throw new ResourceForbiddenException(
        `You can't create company structure is_hq with other types besides type store`
      );
    }

    if (structureComponent.type === CompanyStructureTypeEnum.COMPANY) {
      const companyStructures = await this.companyStructureRepo.find({
        relations: { companyStructureComponent: true }
      });
      companyStructures.forEach((companyStructure: CompanyStructure) => {
        if (
          companyStructure.companyStructureComponent.type ===
          CompanyStructureTypeEnum.COMPANY
        ) {
          throw new ResourceConflictException(
            'company',
            `You can create only one company`
          );
        }
      });
    }

    if (structureComponent.type === CompanyStructureTypeEnum.OUTLET) {
      const isExist = await this.fingerprintDeviceRepo.findOne({
        where: { id: createCompanyStructureDto.fingerprintDeviceId }
      });

      if (!isExist) {
        throw new ResourceNotFoundException(
          'fingerprint device',
          createCompanyStructureDto.fingerprintDeviceId
        );
      }
    }

    await this.validateParent(
      createCompanyStructureDto,
      structureComponent,
      companyStructureId
    );

    return structureComponent;
  };

  async validateParent(
    createCompanyStructureDto: CreateCompanyStructureDto,
    structureComponent: CompanyStructureComponent,
    companyStructureId: number
  ): Promise<CompanyStructureComponent> {
    let parent: CompanyStructure;
    if (createCompanyStructureDto.parentId) {
      parent = await this.validateParentId(createCompanyStructureDto.parentId);
    }

    if (structureComponent.type !== CompanyStructureTypeEnum.POSITION) {
      delete createCompanyStructureDto.positionLevelId;
    }

    if (structureComponent.type !== CompanyStructureTypeEnum.OUTLET) {
      delete createCompanyStructureDto.fingerprintDeviceId;
    }

    if (parent) {
      switch (structureComponent.type) {
        case CompanyStructureTypeEnum.LOCATION: {
          if (
            parent.companyStructureComponent.type !==
            CompanyStructureTypeEnum.COMPANY
          ) {
            throw new ResourceNotFoundException(
              `You have to create company first`
            );
          }
          break;
        }
        case CompanyStructureTypeEnum.OUTLET: {
          if (!createCompanyStructureDto.fingerprintDeviceId) {
            throw new ResourceNotFoundException(
              'fingerprintIpAddress is required for type outlet'
            );
          }
          if (
            parent.companyStructureComponent.type !==
            CompanyStructureTypeEnum.LOCATION
          ) {
            throw new ResourceNotFoundException(
              `You have to create location first`
            );
          }
          break;
        }
        case CompanyStructureTypeEnum.DEPARTMENT: {
          if (
            parent.companyStructureComponent.type !==
            CompanyStructureTypeEnum.OUTLET
          ) {
            throw new ResourceNotFoundException(
              `You have to create outlet first`
            );
          }
          break;
        }
        case CompanyStructureTypeEnum.TEAM: {
          if (
            parent.companyStructureComponent.type !==
              CompanyStructureTypeEnum.DEPARTMENT &&
            parent.companyStructureComponent.type !==
              CompanyStructureTypeEnum.TEAM
          ) {
            throw new ResourceNotFoundException(
              `You have to create department first or parentId is not a type of team`
            );
          }
          break;
        }
        case CompanyStructureTypeEnum.POSITION: {
          if (!createCompanyStructureDto.positionLevelId) {
            throw new ResourceNotFoundException(
              `positionLevelId is required for type position`
            );
          }

          await this.validatePositionLevel(
            createCompanyStructureDto.positionLevelId
          );

          if (parent.id) {
            await this.validatePositionInTeam(
              parent.id,
              createCompanyStructureDto.positionLevelId,
              companyStructureId
            );
          }

          if (
            parent.companyStructureComponent.type !==
            CompanyStructureTypeEnum.TEAM
          ) {
            throw new ResourceNotFoundException(
              'You have to create team first'
            );
          }
          break;
        }
      }
    }
    return structureComponent;
  }

  /**
   * This function is used to validate duplicate position level in team.
   * @param parentId
   * @param positionLevelId
   * @param positionId
   */
  validatePositionInTeam = async (
    parentId: number,
    positionLevelId: number,
    positionId: number
  ) => {
    const team = await this.validateParentId(parentId);

    if (
      team?.companyStructureComponent?.type !== CompanyStructureTypeEnum.TEAM
    ) {
      return;
    }

    const children = await this.companyStructureRepo.find({
      where: { parentId: { id: parentId } },
      relations: { positionLevelId: true }
    });

    if (children.length) {
      children.forEach((child: any) => {
        const theSamePositionLevel = positionId
          ? positionId !== child.id &&
            child.positionLevelId?.id === positionLevelId
          : child.positionLevelId?.id === positionLevelId;

        if (theSamePositionLevel) {
          throw new ResourceConflictException(
            'positionLevelId',
            'Position level already exist in this division'
          );
        }
      });
    }

    if (team.parentId) {
      await this.validatePositionInTeam(
        team.parentId.id,
        positionLevelId,
        positionId
      );
    }
  };

  validateParentId = async (id: number) => {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: { id },
      relations: {
        companyStructureComponent: true,
        parentId: {
          companyStructureComponent: true
        }
      },
      select: {
        id: true,
        description: true,
        address: true,
        lastRetrieveDate: true,
        isHq: true,
        structureType: true,
        companyStructureComponent: {
          id: true,
          name: true,
          type: true
        },
        parentId: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
    if (!companyStructure) {
      throw new ResourceNotFoundException('parent', id);
    }
    return companyStructure;
  };

  async validatePositionLevel(id: number) {
    const positionLevel = await this.positionLevelRepo.findOne({
      where: { id }
    });
    if (!positionLevel) {
      throw new ResourceNotFoundException(
        CompanyStructureConstants.POSITION_LEVEL,
        id
      );
    }
    return positionLevel;
  }

  async create(
    createCompanyStructureDto: CreateCompanyStructureDto,
    id?: number
  ) {
    try {
      await this.validateCompanyStructureComponentId(
        createCompanyStructureDto.companyStructureComponentId,
        createCompanyStructureDto,
        id
      );

      if (id) {
        await this.findOne(id);
      }
      const companyStructure = this.companyStructureRepo.create({
        id: id ?? null,
        address: createCompanyStructureDto.address || null,
        description: createCompanyStructureDto.description || null,
        companyStructureComponent: {
          id: createCompanyStructureDto.companyStructureComponentId
        },
        postProbationBenefitIncrementPolicy: {
          id: createCompanyStructureDto.postProbationBenefitIncrementPolicyId
        },
        positionLevelId: {
          id: createCompanyStructureDto?.positionLevelId ?? null
        },
        parentId: {
          id: createCompanyStructureDto?.parentId ?? null
        },
        isHq: createCompanyStructureDto.isHq,
        fingerprintDevice: { id: createCompanyStructureDto.fingerprintDeviceId }
      });
      return await this.companyStructureRepo.save(companyStructure);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        companyStructureConstraint,
        createCompanyStructureDto
      );
    }
  }

  async exportFile(
    pagination: PaginationQueryCompanyStructureDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.COMPANY_STRUCTURE,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationQueryCompanyStructureDto) {
    const companyStructureIds: number[] = [];
    // take companyStructureIds under either location or outlet when user query
    if (pagination.locationId || pagination.outletId) {
      companyStructureIds.push(
        ...(await this.handleQueryStructureTree(
          pagination.locationId,
          pagination.outletId
        ))
      );
    }

    const data = await GetPagination(
      this.companyStructureRepo,
      pagination,
      companyStructureSearchableColumns,
      {
        where: {
          id: companyStructureIds.length ? In(companyStructureIds) : null,
          companyStructureComponent: {
            id: pagination.companyStructureComponentId,
            type: pagination.type
          },
          positionLevelId: {
            levelNumber: pagination.positionLevelNumber
          },
          employeePosition: {
            employee: {
              id: pagination.employeeId
            }
          },
          fingerprintDevice: {
            id: pagination.fingerprintDeviceId
          },
          parentId: {
            id: pagination.parentId,
            companyStructureComponent: {
              type: pagination.companyComponentType
            }
          }
        },
        select: {
          id: true,
          description: true,
          address: true,
          lastRetrieveDate: true,
          isHq: true,
          structureType: true,
          parentId: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true,
              nameKh: true,
              type: true
            }
          },
          companyStructureComponent: {
            id: true,
            name: true,
            nameKh: true,
            type: true
          } as FindOptionsSelect<CompanyStructureComponent>,
          fingerprintDevice: {
            id: true,
            ipAddress: true,
            port: true,
            modelName: true
          },
          positionLevelId: {
            id: true,
            levelTitle: true,
            levelNumber: true
          } as FindOptionsSelect<PositionLevel>,
          postProbationBenefitIncrementPolicy: {
            id: true,
            name: true
          } as FindOptionsSelect<BenefitIncreasementPolicy>
        },
        relation: {
          parentId: {
            companyStructureComponent: true
          },
          positionLevelId: true,
          companyStructureComponent: true,
          fingerprintDevice: true,
          postProbationBenefitIncrementPolicy: true
        } as FindOptionsRelations<CompanyStructure>
      }
    );

    if (pagination.parentId) {
      const companyStructure = await this.companyStructureRepo.findOne({
        where: { id: pagination.parentId },
        relations: { companyStructureComponent: true },
        select: {
          companyStructureComponent: { id: true, name: true, type: true }
        }
      });

      const allowedTypes = [
        CompanyStructureTypeEnum.TEAM,
        CompanyStructureTypeEnum.DEPARTMENT
      ];

      if (
        allowedTypes.includes(companyStructure.companyStructureComponent.type)
      ) {
        const companyStructures: CompanyStructure[] = [];
        await this.getSubTeams(pagination, data.data, companyStructures);
        data.data.push(...companyStructures);
      }
    }
    return {
      data: await this.mappingCompanyStructureResponse(
        data.data,
        CompanyStructureTypeEnum.LOCATION
      ), // mapping company structure tree and parent tree to display
      totalCount: data.totalCount
    };
  }

  async getSubTreeOfTeamAndLocation(
    id: number,
    companyStructures: CompanyStructure[],
    companyStructureTypeEnum: CompanyStructureTypeEnum
  ) {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          id,
          companyStructureComponent: { type: companyStructureTypeEnum }
        },
        relations: {
          parentId: true,
          positionLevelId: true,
          companyStructureComponent: true,
          fingerprintDevice: true,
          postProbationBenefitIncrementPolicy: true,
          children: { companyStructureComponent: true }
        },
        select: {
          id: true,
          parentId: {
            id: true
          },
          description: true,
          address: true,
          lastRetrieveDate: true,
          isHq: true,
          structureType: true,
          positionLevelId: {
            id: true,
            levelTitle: true,
            levelNumber: true
          },
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          },
          fingerprintDevice: {
            id: true,
            port: true,
            modelName: true,
            ipAddress: true
          },
          postProbationBenefitIncrementPolicy: {
            id: true,
            name: true
          },
          children: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

    if (!companyStructure) {
      throw new ResourceNotFoundException(
        `company structure of ${companyStructureTypeEnum}`
      );
    }

    let companyStructureTree: any = await this.traverseTree(companyStructure);
    companyStructureTree = await this.mappingNameCompanyStructureTree(
      companyStructure,
      companyStructureTypeEnum
    );
    companyStructures.push(companyStructureTree);
  }

  async listCompanyStructureTreeByParentId(id: number) {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: {
        id
      },
      relations: {
        companyStructureComponent: true
      }
    });
    if (!companyStructure) {
      throw new ResourceNotFoundException(
        CompanyStructureConstants.COMPANY_STRUCTURE,
        id
      );
    }
    if (
      companyStructure.companyStructureComponent.type !==
      CompanyStructureTypeEnum.COMPANY
    ) {
      throw new ResourceNotFoundException(
        `Resource of ${id} is not type of COMPANY`
      );
    }
    const data = [];
    const locationData = [];
    const locations = await this.companyStructureRepo.find({
      where: { parentId: { id: companyStructure.id } },
      relations: { companyStructureComponent: true }
    });
    if (locations.length > 0) {
      for (const location of locations) {
        const outlets = await this.companyStructureRepo.find({
          where: { parentId: { id: location.id } },
          relations: { companyStructureComponent: true }
        });
        const outletData = [];
        let departmentData;
        let positionData;
        if (outlets.length > 0) {
          for (const outlet of outlets) {
            const outletDatas =
              await this.companyStructureComponentRepo.findOne({
                where: {
                  id: outlet.companyStructureComponent.id,
                  type: CompanyStructureTypeEnum.OUTLET
                }
              });
            const departments = await this.companyStructureRepo.find({
              where: { parentId: { id: outlet.id } },
              relations: { companyStructureComponent: true }
            });
            if (departments.length > 0) {
              departmentData = [];
              for (const department of departments) {
                const departmentDatas =
                  await this.companyStructureComponentRepo.findOne({
                    where: {
                      id: department.companyStructureComponent.id,
                      type: CompanyStructureTypeEnum.DEPARTMENT
                    }
                  });
                const positions = await this.companyStructureRepo.find({
                  where: { parentId: { id: department.id } },
                  relations: { companyStructureComponent: true }
                });
                if (positions.length > 0) {
                  positionData = [];
                  for (const position of positions) {
                    const positionDatas =
                      await this.companyStructureComponentRepo.findOne({
                        where: {
                          id: position.companyStructureComponent.id,
                          type: CompanyStructureTypeEnum.POSITION
                        }
                      });
                    removeUnnecessaryProps(positionDatas);
                    positionData.push(positionDatas);
                  }
                }
                removeUnnecessaryProps(departmentDatas);
                departmentData.push({
                  ...departmentDatas,
                  positions: positionData
                });
              }
            }
            removeUnnecessaryProps(outletDatas);
            outletData.push({ ...outletDatas, departments: departmentData });
          }
        }
        const tempData = await this.companyStructureComponentRepo.findOne({
          where: {
            id: location.companyStructureComponent.id,
            type: CompanyStructureTypeEnum.LOCATION
          }
        });
        removeUnnecessaryProps(tempData);
        locationData.push({ ...tempData, outlets: outletData });
      }
    }
    removeUnnecessaryProps(companyStructure);
    data.push({ ...companyStructure, locations: locationData });
    return data;
  }

  async listStructureTreeById(
    companyStructure: CompanyStructure
  ): Promise<object[]> {
    let structureCompany = [];
    structureCompany = await this.checkTypeOfCompanyStructure(
      companyStructure.id,
      structureCompany
    );

    switch (companyStructure.companyStructureComponent.type) {
      case CompanyStructureTypeEnum.TEAM: {
        return [
          ...structureCompany.slice(0, 2),
          structureCompany[structureCompany.length - 1]
        ];
      }
      case CompanyStructureTypeEnum.POSITION: {
        return [
          ...structureCompany.slice(0, 2),
          ...structureCompany.slice(
            structureCompany.length - 2,
            structureCompany.length - 1
          )
        ];
      }
      default:
        break;
    }
  }

  async checkTypeOfCompanyStructure(id: number, structureCompany: any) {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          id,
          companyStructureComponent: {
            type: Not(
              In([
                CompanyStructureTypeEnum.COMPANY,
                CompanyStructureTypeEnum.LOCATION
              ])
            )
          }
        },
        relations: {
          companyStructureComponent: true,
          parentId: true
        },
        select: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          },
          parentId: {
            id: true
          }
        }
      });

    if (companyStructure) {
      structureCompany.unshift({
        name: companyStructure.companyStructureComponent.name
      });

      await this.checkTypeOfCompanyStructure(
        companyStructure.parentId.id,
        structureCompany
      );
    }

    return structureCompany;
  }

  displayNestedTeam = async (departmentId: number) => {
    const teamData: any = [];

    const teams = await this.companyStructureRepo.find({
      where: {
        parentId: {
          id: departmentId
        }
      },
      relations: { companyStructureComponent: true, positionLevelId: true }
    });
    if (teams.length > 0) {
      await Promise.all(
        teams.map(async (team: any) => {
          if (
            team.companyStructureComponent.type ===
            CompanyStructureTypeEnum.POSITION
          ) {
            teamData.push({
              id: team.id,
              name: team.companyStructureComponent.name,
              nameKh: team.companyStructureComponent.nameKh,
              type: team.companyStructureComponent.type,
              positionLevel: team.positionLevelId
            });
          } else {
            const data = await this.listTeam(team.id);
            teamData.push({
              id: team.id,
              name: team.companyStructureComponent.name,
              nameKh: team.companyStructureComponent.nameKh,
              type: team.companyStructureComponent.type,
              teams: data.teams,
              positions: data.positions
            });
          }
        })
      );
    }
    return teamData;
  };

  listTeam = async (id: number) => {
    const subTeam = [];
    const positionData = [];
    const result = await this.companyStructureRepo.find({
      where: {
        parentId: { id },
        companyStructureComponent: {
          type: In([
            CompanyStructureTypeEnum.TEAM,
            CompanyStructureTypeEnum.POSITION
          ])
        }
      },
      relations: {
        companyStructureComponent: true,
        positionLevelId: true
      }
    });

    if (result.length > 0) {
      await Promise.all(
        result.map(async (value: any) => {
          if (
            value.companyStructureComponent.type ===
            CompanyStructureTypeEnum.TEAM
          ) {
            const data = await this.listTeam(value.id);
            subTeam.push({
              id: value.id,
              name: value.companyStructureComponent.name,
              nameKh: value.companyStructureComponent.nameKh,
              type: value.companyStructureComponent.type,
              teams: data.teams,
              positions: data.positions
            });
          } else {
            positionData.push({
              id: value.id,
              name: value.companyStructureComponent.name,
              nameKh: value.companyStructureComponent.nameKh,
              type: value.companyStructureComponent.type,
              positionLevel: value.positionLevelId
            });
          }
        })
      );
    }
    return { teams: subTeam, positions: positionData };
  };

  positionData = [];

  spreadOutPosition = (teams: any) => {
    if (teams.length > 0) {
      teams.map((value: any) => {
        if (value.type === CompanyStructureTypeEnum.POSITION) {
          this.positionData.push(value);
        }
        if (value.teams && value.teams.length > 0) {
          this.spreadOutPosition(value.teams);
        }
        if (value.positions && value.positions.length > 0) {
          value.positions.map((data: any) => {
            this.positionData.push(data);
          });
        }
      });
    }
    return this.positionData.sort((a: any, b: any) => {
      if (a.positionLevel.levelNumber < b.positionLevel.levelNumber) {
        return 1;
      }

      if (b.positionLevel.levelNumber < a.positionLevel.levelNumber) {
        return -1;
      }

      return 0;
    });
  };

  teamData = [];

  spreadOutTeams = (teams: any) => {
    if (teams.length > 0) {
      teams.map((team: any) => {
        if (team.type === CompanyStructureTypeEnum.TEAM) {
          delete team.positions;
          this.teamData.push({ id: team.id, name: team.name, type: team.type });
        }
        if (team.teams && team.teams.length > 0) {
          delete team.positions;
          this.spreadOutTeams(team.teams);
        }
      });
    }
    return this.teamData;
  };

  listTeamsUnderDepartmentByDepartmentId = async (id: number) => {
    const department = await this.validateDepartment(id);
    return await this.getTeamsByDepartments([department]);
  };

  async listTeamsInByOutletId(
    id: number,
    pagination: PaginationQueryCompanyStructureDto
  ) {
    const outlet = await this.companyStructureRepo.findOne({
      where: {
        id,
        companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
      }
    });
    if (!outlet) {
      throw new ResourceNotFoundException('company structure', id);
    }

    // get all departments under outlet
    const departments = await this.companyStructureRepo.find({
      where: { parentId: { id } }
    });

    const companyStructureTeams = (await this.getTeamsByDepartments(
      departments
    )) as any;

    return this.searchTeamsByKeyword(companyStructureTeams, pagination);
  }

  listAllTeamInHq = async () => {
    const departments = await this.listDepartmentOfHq();

    return await this.getTeamsByDepartments(departments);
  };

  listTeamInDepartmentOrPositionInTeam = async (id: number) => {
    const data = await this.companyStructureRepo.findOne({
      where: {
        id,
        companyStructureComponent: {
          type: In([
            CompanyStructureTypeEnum.TEAM,
            CompanyStructureTypeEnum.DEPARTMENT
          ])
        }
      },
      relations: { companyStructureComponent: true }
    });

    if (!data) {
      throw new ResourceNotFoundException('company structure', id);
    }

    const companyStructures = [];
    await this.getCompanyStructureByParentId(data.id, companyStructures);
    return this.mappingCompanyStructure(companyStructures);
  };

  validateDepartment = async (id: number): Promise<CompanyStructure> => {
    const department = await this.companyStructureRepo.findOne({
      where: {
        id,
        companyStructureComponent: { type: CompanyStructureTypeEnum.DEPARTMENT }
      },
      relations: { companyStructureComponent: true }
    });

    if (!department) {
      throw new ResourceNotFoundException('company structure department', id);
    }
    return department;
  };

  listTeamsByDepartmentId = async (id: number) => {
    const department = await this.validateDepartment(id);
    const data = await this.displayNestedTeam(department.id);
    return {
      id: department.id,
      name: department.companyStructureComponent.name,
      nameKh: department.companyStructureComponent.nameKh,
      type: department.companyStructureComponent.type,
      teams: data
    };
  };

  async listDepartmentOfHq() {
    const outlet = await this.companyStructureRepo.find({
      where: {
        isHq: true,
        companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
      },
      relations: { companyStructureComponent: true }
    });

    if (!outlet.length) {
      return [];
    }

    return await this.companyStructureRepo.find({
      where: { parentId: { id: outlet[0].id } },
      relations: { companyStructureComponent: true }
    });
  }

  async listCompanyStructureTree(isShowPosition?: boolean) {
    const companyStructures = await this.companyStructureRepo.find({
      where: {
        companyStructureComponent: { type: CompanyStructureTypeEnum.COMPANY }
      },
      relations: { companyStructureComponent: true }
    });
    const data = [];
    const locationData = [];
    for (const companyStructure of companyStructures) {
      const locations = await this.companyStructureRepo.find({
        where: { parentId: { id: companyStructure.id } },
        relations: { companyStructureComponent: true }
      });
      if (locations.length > 0) {
        for (const location of locations) {
          const outlets = await this.companyStructureRepo.find({
            where: { parentId: { id: location.id } },
            relations: { companyStructureComponent: true }
          });
          const outletData = [];
          let departmentData = [];
          if (outlets.length > 0) {
            for (const outlet of outlets) {
              const outletDatas =
                await this.companyStructureComponentRepo.findOne({
                  where: {
                    id: outlet.companyStructureComponent.id,
                    type: CompanyStructureTypeEnum.OUTLET
                  }
                });
              const departments = await this.companyStructureRepo.find({
                where: { parentId: { id: outlet.id } },
                relations: { companyStructureComponent: true }
              });
              if (departments.length > 0) {
                departmentData = [];
                for (const department of departments) {
                  const departmentDatas =
                    await this.companyStructureComponentRepo.findOne({
                      where: {
                        id: department.companyStructureComponent.id,
                        type: CompanyStructureTypeEnum.DEPARTMENT
                      }
                    });
                  const result = await this.displayNestedTeam(department.id);

                  const positions = this.spreadOutPosition(result);
                  this.positionData = [];

                  removeUnnecessaryProps(departmentDatas);
                  departmentData.push({
                    name: departmentDatas.name,
                    id: department.id,
                    positions: isShowPosition ? positions : null
                  });
                }
              }
              removeUnnecessaryProps(outletDatas);
              outletData.push({
                id: outlet.id,
                name: outletDatas.name,
                departments: departmentData
              });
              departmentData = [];
            }
          }
          const tempData = await this.companyStructureComponentRepo.findOne({
            where: {
              id: location.companyStructureComponent.id,
              type: CompanyStructureTypeEnum.LOCATION
            }
          });
          removeUnnecessaryProps(tempData);
          locationData.push({
            id: location.id,
            name: tempData.name,
            outlets: outletData
          });
        }
      }
      removeUnnecessaryProps(companyStructure);
      data.push({ ...companyStructure, locations: locationData });
    }

    return data;
  }

  async listOrganizationChartByOutlet(id: number) {
    const companyStructure: CompanyStructure =
      await this.getCompanyStructureOutletById(id);

    const companyStructureTree: any = await this.traverseTree(companyStructure);

    return {
      id: companyStructure.id,
      name: companyStructure.companyStructureComponent.name,
      type: companyStructure.companyStructureComponent.type,
      children: companyStructureTree?.children || []
    };
  }

  async getCompanyStructureOutletByIds(outletId: number) {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          id: outletId,
          companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
        },
        relations: {
          companyStructureComponent: true,
          children: { companyStructureComponent: true }
        },
        select: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          },
          children: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

    if (!companyStructure) {
      throw new ResourceNotFoundException(
        this.COMPANY_STRUCTURE,
        'company structure outlet'
      );
    }

    return companyStructure;
  }

  async getCompanyStructureOutletById(id: number): Promise<CompanyStructure> {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          id,
          companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
        },
        relations: {
          companyStructureComponent: true,
          children: { companyStructureComponent: true }
        },
        select: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          },
          children: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

    if (!companyStructure) {
      throw new ResourceNotFoundException(
        this.COMPANY_STRUCTURE,
        'company structure outlet'
      );
    }

    return companyStructure;
  }

  async listOrganizationChartNewVersion() {
    const companyStructure: CompanyStructure = await this.getCompanyStructure();

    return await this.mappingOrganizationChart(companyStructure);
  }

  async mappingOrganizationChart(companyStructure: CompanyStructure) {
    if (companyStructure?.children.length) {
      return {
        id: companyStructure.id,
        name: companyStructure.companyStructureComponent.name,
        type: companyStructure.companyStructureComponent.type,
        children:
          companyStructure?.children.map((child: CompanyStructure) => {
            return {
              id: child.id,
              name: child.companyStructureComponent.name,
              type: child.companyStructureComponent.type,
              children:
                child?.children.map((child: CompanyStructure) => {
                  return {
                    id: child.id,
                    name: child.companyStructureComponent.name,
                    type: child.companyStructureComponent.type,
                    isHq: child.isHq
                  };
                }) || []
            };
          }) || []
      };
    }
  }

  async getCompanyStructure(): Promise<CompanyStructure> {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          companyStructureComponent: { type: CompanyStructureTypeEnum.COMPANY }
        },
        relations: {
          companyStructureComponent: true,
          children: {
            children: { companyStructureComponent: true },
            companyStructureComponent: true
          }
        },
        select: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          },
          children: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true,
              type: true
            },
            children: {
              id: true,
              isHq: true,
              companyStructureComponent: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      });

    if (!companyStructure) {
      throw new ResourceNotFoundException('company structure');
    }

    return companyStructure;
  }

  traverseTree = async (companyStructure: any) => {
    const children: any = companyStructure.children || [];

    companyStructure.children = [];

    if (!children?.length) {
      return companyStructure;
    }

    companyStructure.children = await Promise.all(
      children.map(async (child: any) => {
        const node = await this.companyStructureRepo.findOne({
          where: {
            id: child.id
          },
          relations: {
            children: true,
            companyStructureComponent: true,
            positionLevelId: true,
            employeePosition: {
              companyStructurePosition: true,
              employee: true
            }
          },
          select: EMPLOYEE_PROFILE_SELECTED_FIELDS
        });

        if (node) {
          let employeeProfile = [];

          const nodeWithChildren = await this.traverseTree(node);
          if (nodeWithChildren.employeePosition) {
            employeeProfile = await this.getEmployeeWithProfile(
              nodeWithChildren.employeePosition,
              nodeWithChildren.id
            );
          }

          return {
            id: nodeWithChildren.id,
            name: nodeWithChildren.companyStructureComponent.name,
            type: nodeWithChildren.companyStructureComponent.type,
            positionLevel: nodeWithChildren.positionLevelId,
            children: employeeProfile
              ? [...nodeWithChildren.children, ...employeeProfile]
              : [...nodeWithChildren.children]
          };
        }
      })
    );

    return companyStructure;
  };

  getEmployeeWithProfile = async (
    employeePosition: EmployeePosition[],
    companyStructurePositionId: number
  ) => {
    const employeeProfiles = [];
    if (!employeePosition.length) {
      return [];
    }

    const activeEmployees: string[] = [
      EmployeeStatusEnum.ACTIVE,
      EmployeeStatusEnum.IN_PROBATION
    ];

    const validPositions = employeePosition.filter(
      (position: EmployeePosition) => {
        if (
          position.companyStructurePosition.id === companyStructurePositionId &&
          activeEmployees.includes(position?.employee?.status)
        ) {
          return position;
        }
      }
    );

    for (const position of validPositions) {
      if (position.employee && position.isMoved === false) {
        const employeeProfile: Media = await this.mediaRepository.findOne({
          where: {
            entityId: position.employee.id,
            entityType: MediaEntityTypeEnum.EMPLOYEE_PROFILE
          }
        });
        employeeProfiles.push({
          id: position.employee.id,
          name: position.employee.displayFullNameEn,
          type: 'EMPLOYEE',
          profile: employeeProfile
        });
      }
    }

    return employeeProfiles;
  };

  async findOne(id: number) {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: {
        id
      },
      relations: {
        parentId: true,
        positionLevelId: true,
        companyStructureComponent: true,
        fingerprintDevice: true,
        postProbationBenefitIncrementPolicy: true
      },
      select: {
        postProbationBenefitIncrementPolicy: {
          id: true,
          name: true
        } as FindOptionsSelect<BenefitIncreasementPolicy>
      }
    });
    if (!companyStructure) {
      throw new ResourceNotFoundException(
        CompanyStructureConstants.COMPANY_STRUCTURE,
        id
      );
    }

    return (await this.mappingNameCompanyStructureTree(
      companyStructure,
      CompanyStructureTypeEnum.LOCATION
    )) as any;
  }

  async validateUpdateDuplicateHQ(companyStructureId: number) {
    const structure = await this.companyStructureRepo.findOne({
      where: {
        isHq: true,
        id: Not(companyStructureId),
        companyStructureComponent: {
          type: CompanyStructureTypeEnum.OUTLET
        }
      }
    });
    if (structure) {
      throw new ResourceConflictException('isHQ', 'HQ already exist');
    }
  }

  async update(
    id: number,
    updateCompanyStructureDto: CreateCompanyStructureDto
  ) {
    try {
      const companyStructure = await this.findOne(id);
      if (updateCompanyStructureDto.isHq) {
        if (
          companyStructure.companyStructureComponent.type !==
          CompanyStructureTypeEnum.OUTLET
        ) {
          throw new ResourceForbiddenException(
            `You can't create company structure isHQ with other types besides type outlet.`
          );
        }
        await this.validateUpdateDuplicateHQ(id);
      }

      if (updateCompanyStructureDto.parentId === null) {
        if (
          companyStructure.companyStructureComponent.type !==
          CompanyStructureTypeEnum.COMPANY
        ) {
          throw new ResourceForbiddenException(`ParentId can't be null`);
        }
      }

      if (updateCompanyStructureDto.parentId) {
        const parent = await this.companyStructureRepo.findOne({
          where: { id: updateCompanyStructureDto.parentId }
        });

        if (!parent) {
          throw new ResourceNotFoundException(
            CompanyStructureConstants.PARENT,
            updateCompanyStructureDto.parentId
          );
        }
      }
      if (updateCompanyStructureDto.positionLevelId) {
        const positionLevel = await this.positionLevelRepo.findOne({
          where: { id: updateCompanyStructureDto.positionLevelId }
        });

        if (!positionLevel) {
          throw new ResourceNotFoundException(
            CompanyStructureConstants.POSITION_LEVEL,
            updateCompanyStructureDto.positionLevelId
          );
        }
      }

      if (updateCompanyStructureDto.companyStructureComponentId) {
        const structureComponent =
          await this.companyStructureComponentRepo.findOne({
            where: { id: updateCompanyStructureDto.companyStructureComponentId }
          });

        companyStructure.companyStructureComponent = structureComponent;

        if (!structureComponent) {
          throw new ResourceNotFoundException(
            this.COMPANY_STRUCTURE_COMPONENT,
            updateCompanyStructureDto.companyStructureComponentId
          );
        }
      }
      if (
        companyStructure.companyStructureComponent.type !==
          CompanyStructureTypeEnum.POSITION &&
        updateCompanyStructureDto.postProbationBenefitIncrementPolicyId
      ) {
        throw new ResourceForbiddenException(
          'postProbationBenefitIncreasementId should not be created with other type, besides type of position'
        );
      }

      if (updateCompanyStructureDto.postProbationBenefitIncrementPolicyId) {
        await this.benefitIncreasementPolicyService.findOne(
          updateCompanyStructureDto.postProbationBenefitIncrementPolicyId
        );
      }

      const companyStructureUpdate = Object.assign(companyStructure, {
        ...updateCompanyStructureDto,
        postProbationBenefitIncreasementPolicy: {
          id: updateCompanyStructureDto.postProbationBenefitIncrementPolicyId
        }
      });

      if (updateCompanyStructureDto.fingerprintDeviceId) {
        const fingerprintDevice = await this.fingerprintDeviceRepo.findOne({
          where: { id: updateCompanyStructureDto.fingerprintDeviceId }
        });

        if (!fingerprintDevice) {
          throw new ResourceNotFoundException(
            'fingerprint device',
            updateCompanyStructureDto.fingerprintDeviceId
          );
        }
        companyStructureUpdate.fingerprintDevice = fingerprintDevice;
      }

      return await this.companyStructureRepo.save(companyStructureUpdate);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        companyStructureConstraint,
        updateCompanyStructureDto
      );
    }
  }

  async delete(id: number): Promise<void> {
    const companyStructure = await this.findOne(id);
    await this.checkParent(companyStructure.id);
    await this.companyStructureRepo.delete(id);
  }

  async checkParent(parentId: number) {
    const companyStructures = await this.companyStructureRepo.find({
      where: { parentId: { id: parentId } }
    });
    if (companyStructures.length !== 0) {
      throw new ResourceForbiddenException(
        `You are not allowed to modify because other records use it`
      );
    }
  }

  async grpcGetCompanyStructureOutletById(
    companyStructureOutletId: EmployeeProto.CompanyStructureOutletId
  ) {
    const companyStructureOutlet = await this.companyStructureRepo.findOne({
      where: { id: companyStructureOutletId.id },
      relations: {
        companyStructureComponent: true
      }
    });
    if (!companyStructureOutlet) {
      throw new RpcException({
        message: `Resource ${this.COMPANY_STRUCTURE} of ${companyStructureOutletId.id} not found`,
        code: 5
      });
    }
    const companyStructureComponent =
      await this.companyStructureComponentRepo.findOne({
        where: {
          id: companyStructureOutlet.companyStructureComponent.id,
          type: CompanyStructureTypeEnum.OUTLET
        }
      });
    if (!companyStructureComponent) {
      throw new RpcException({
        message: `Resource ${this.COMPANY_STRUCTURE} of ${companyStructureOutletId.id} not found`,
        code: 5
      });
    }
    return { data: companyStructureComponent };
  }

  async grpcGetCompanyStructureOutlet(): Promise<{
    data: EmployeeProto.CompanyStructure[];
  }> {
    const companyStructureOutlet = await this.companyStructureRepo.find({
      where: {
        companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
      },
      relations: {
        companyStructureComponent: true,
        fingerprintDevice: true
      }
    });
    if (!companyStructureOutlet) {
      throw new RpcException({
        message: `Resource not found`,
        code: 5
      });
    }

    const result: EmployeeProto.CompanyStructure[] = companyStructureOutlet.map(
      (item: CompanyStructure) => ({
        id: item.id,
        ipAddress: item.fingerprintDevice?.ipAddress,
        lastRetrieveDate: item.lastRetrieveDate?.toString(),
        port: item.fingerprintDevice.port,
        name: item.companyStructureComponent.name,
        fingerprintDeviceId: item.fingerprintDevice.id
      })
    );

    return { data: result };
  }

  async getOutlets(type: string) {
    const outlet = type.toUpperCase();
    const outlets = await this.companyStructureRepo.find({
      where: {
        companyStructureComponent: { type: outlet }
      } as FindOptionsWhere<CompanyStructure>
    });
    if (!outlets) {
      throw new ResourceNotFoundException(this.OUTLET, type);
    }
    return outlets;
  }

  async getLatestOutlet(id: number) {
    const type = 'OUTLET';
    const outlets = await this.companyStructureRepo.find({
      where: {
        id: MoreThan(id),
        companyStructureComponent: { type: type }
      } as FindOptionsWhere<CompanyStructure>
    });
    if (!outlets) {
      throw new ResourceNotFoundException(this.OUTLET, id);
    }
    return outlets;
  }

  async updateLatestOutlet(updateBody: UpdateCompanyStructureDto) {
    const type = 'OUTLET';
    const outlet = await this.companyStructureRepo.findOne({
      where: {
        id: updateBody.companyStructureComponentId,
        companyStructureComponent: {
          type: type
        }
      } as FindOptionsWhere<CompanyStructure>
    });
    if (!outlet) {
      throw new ResourceNotFoundException(
        this.OUTLET,
        updateBody.companyStructureComponentId
      );
    }
    return await this.companyStructureRepo.save(
      Object.assign(outlet, {
        lastRetrieveDate: dayJs(updateBody.lastRetrieveDate)
          .utc(true)
          .format(DEFAULT_DATE_TIME_FORMAT)
      })
    );
  }

  async duplicateDepartmentToStores(
    companyStructureDepartmentId: number,
    duplicateCompanyStructureDto: DuplicateCompanyStructureDto
  ): Promise<CompanyStructure> {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          id: companyStructureDepartmentId,
          companyStructureComponent: {
            type: CompanyStructureTypeEnum.DEPARTMENT
          }
        },
        relations: {
          companyStructureComponent: true,
          children: { companyStructureComponent: true },
          positionLevelId: true,
          fingerprintDevice: true
        },
        select: DUPLICATE_COMPANY_STRUCTURE_DEPARTMENT_SELECTED_FIELDS
      });

    if (!companyStructure) {
      throw new ResourceNotFoundException(
        'company structure department',
        companyStructureDepartmentId
      );
    }

    if (!companyStructure?.children.length) {
      throw new ResourceNotFoundException(
        `You can't duplicate this structure because it is empty`
      );
    }

    let storeIds = duplicateCompanyStructureDto.companyStructureStoreIds;

    await this.checkStoreIds(storeIds);

    if (!duplicateCompanyStructureDto.isIncluded) {
      storeIds = duplicateCompanyStructureDto.companyStructureStoreIds;

      const companyStructureStores: CompanyStructure[] =
        await this.companyStructureRepo.find({
          where: {
            id: Not(In(storeIds)),
            companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
          },
          relations: { companyStructureComponent: true }
        });

      if (!companyStructureStores) {
        throw new ResourceNotFoundException(
          this.COMPANY_STRUCTURE,
          'company structure outlet'
        );
      }

      storeIds = companyStructureStores.map(
        (companyStructureStore: CompanyStructure) => {
          return companyStructureStore.id;
        }
      );
    }

    return await this.duplicateCompanyStructure(companyStructure, storeIds);
  }

  async checkStoreIds(storeIds: number[]): Promise<void> {
    await Promise.all(
      storeIds.map(async (storeId: number) => {
        const companyStructureOutlet: CompanyStructure =
          await this.companyStructureRepo.findOne({
            where: {
              id: storeId,
              companyStructureComponent: {
                type: CompanyStructureTypeEnum.OUTLET
              }
            },
            relations: {
              companyStructureComponent: true
            }
          });

        if (!companyStructureOutlet) {
          throw new ResourceNotFoundException(
            'company structure outlet',
            storeId
          );
        }
      })
    );
  }

  async duplicateCompanyStructure(
    companyStructureDepartment: CompanyStructure,
    storeIds: number[]
  ): Promise<CompanyStructure> {
    const children: CompanyStructure[] =
      companyStructureDepartment.children || [];

    companyStructureDepartment.children = [];

    if (!children?.length) {
      return companyStructureDepartment;
    }

    let companyStructure: CompanyStructure;

    await Promise.all(
      storeIds.map(async (storeId: number) => {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
          await queryRunner.connect();
          await queryRunner.startTransaction();

          const companyStructureDto = this.createCompanyStructureDto(
            companyStructureDepartment,
            storeId
          );

          const newCompanyStructureDepartment: CompanyStructure =
            queryRunner.manager.create(CompanyStructure, companyStructureDto);

          const duplicateCompanyStructure: CompanyStructure =
            await queryRunner.manager.save(newCompanyStructureDepartment);

          await this.repeatedInsertCompanyStructure(
            children,
            duplicateCompanyStructure.id,
            queryRunner
          );

          await queryRunner.commitTransaction();
          companyStructure = duplicateCompanyStructure;
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      })
    );
    return companyStructure;
  }

  repeatedInsertCompanyStructure = async (
    children: CompanyStructure[],
    parentId: number,
    queryRunner: QueryRunner
  ): Promise<void[]> => {
    return await Promise.all(
      children.map(async (child: any) => {
        try {
          const node: CompanyStructure =
            await this.companyStructureRepo.findOne({
              where: { id: child.id },
              relations: {
                companyStructureComponent: true,
                children: { companyStructureComponent: true },
                positionLevelId: true,
                fingerprintDevice: true
              },
              select: DUPLICATE_COMPANY_STRUCTURE_DEPARTMENT_SELECTED_FIELDS
            });

          const companyStructureDto = this.createCompanyStructureDto(
            node,
            parentId
          );

          const companyStructure: CompanyStructure = queryRunner.manager.create(
            CompanyStructure,
            companyStructureDto
          );

          const duplicateCompanyStructure: CompanyStructure =
            await queryRunner.manager.save(companyStructure);

          await this.repeatedInsertCompanyStructure(
            node.children,
            duplicateCompanyStructure.id,
            queryRunner
          );
        } catch (error) {
          throw new ResourceBadRequestException(error);
        }
      })
    );
  };

  createCompanyStructureDto = (
    companyStructure: CompanyStructure,
    parentId: number
  ): DeepPartial<CompanyStructure> => {
    return {
      parentId: { id: parentId },
      positionLevelId: companyStructure.positionLevelId
        ? {
            id: companyStructure.positionLevelId.id
          }
        : null,
      companyStructureComponent: companyStructure.companyStructureComponent
        ? {
            id: companyStructure.companyStructureComponent.id
          }
        : null,
      description: companyStructure.description,
      address: companyStructure.address,
      fingerprintDevice: companyStructure.fingerprintDevice
        ? {
            id: companyStructure.fingerprintDevice.id
          }
        : null,
      lastRetrieveDate: companyStructure.lastRetrieveDate
        ? dayJs(companyStructure.lastRetrieveDate)
            .utc(true)
            .format(DEFAULT_DATE_TIME_FORMAT)
        : null,
      isHq: companyStructure.isHq
    } as DeepPartial<CompanyStructure>;
  };

  // ===================== [Private readonly] =====================

  private async handleQueryStructureTree(
    locationId: number,
    outletId: number
  ): Promise<number[]> {
    const companyStructures: CompanyStructure[] =
      await this.companyStructureRepo.find({
        where: { parentId: { id: outletId ?? locationId } },
        relations: { parentId: true },
        select: { id: true, parentId: { id: true } }
      });

    const companyStructureIds: number[] = [];

    if (companyStructures.length) {
      for (const companyStructure of companyStructures) {
        companyStructureIds.push(companyStructure.id);
        await this.getCompanyStructureTreeOfParentId(
          companyStructure.id,
          companyStructureIds
        );
      }
    }

    return companyStructureIds;
  }

  private async getCompanyStructureTreeOfParentId(
    id: number,
    companyStructureIds: number[]
  ): Promise<void> {
    const data: CompanyStructure[] = await this.companyStructureRepo.find({
      where: { parentId: { id } },
      relations: { parentId: true, children: true },
      select: { id: true, parentId: { id: true }, children: { id: true } }
    });

    if (!data.length) {
      return;
    }

    for (const companyStructure of data) {
      companyStructureIds.push(companyStructure.id);

      if (!companyStructure.children.length) {
        continue;
      }

      // loop through children
      for (const child of companyStructure.children) {
        companyStructureIds.push(child.id);
        await this.getCompanyStructureTreeOfParentId(
          child.id,
          companyStructureIds
        );
      }
    }
  }

  private searchTeamsByKeyword(
    companyStructures: CompanyStructureTreeDto[],
    pagination: PaginationQueryCompanyStructureDto
  ): CompanyStructureTreeDto[] {
    if (pagination.name) {
      return companyStructures.filter(
        (companyStructure: CompanyStructureTreeDto) => {
          if (
            companyStructure['nameTree']
              .toLowerCase()
              .includes(pagination.name.toLowerCase())
          ) {
            return companyStructure;
          }
        }
      ) as any;
    }
    return companyStructures;
  }

  private async mappingCompanyStructureResponse(
    companyStructures: CompanyStructure[],
    targetTypeToStop: CompanyStructureTypeEnum
  ): Promise<CompanyStructure[]> {
    const companyStructureResponse: CompanyStructure[] = [];

    if (!companyStructures.length) {
      return companyStructureResponse;
    }

    const allowNameTreeType = [
      CompanyStructureTypeEnum.TEAM,
      CompanyStructureTypeEnum.POSITION,
      CompanyStructureTypeEnum.DEPARTMENT
    ];

    for (const companyStructure of companyStructures) {
      if (
        allowNameTreeType.includes(
          companyStructure.companyStructureComponent.type
        )
      ) {
        companyStructureResponse.push(
          (await this.mappingNameCompanyStructureTree(
            companyStructure,
            targetTypeToStop
          )) as any
        );
      } else {
        companyStructureResponse.push(companyStructure);
      }
    }

    return companyStructureResponse;
  }

  private async mappingNameCompanyStructureTree(
    companyStructure: CompanyStructure,
    targetTypeToStop: CompanyStructureTypeEnum
  ): Promise<object> {
    const structureTree = [companyStructure.companyStructureComponent.name];
    await this.getCompanyStructureTreeName(
      companyStructure.parentId,
      targetTypeToStop,
      structureTree
    );

    return {
      ...companyStructure,
      nameTree: structureTree.reverse().join('/'),
      parentId: {
        ...companyStructure.parentId,
        parentTree: structureTree.slice(0, structureTree.length - 1).join('/')
      }
    };
  }

  private async getCompanyStructureTreeName(
    companyStructure: CompanyStructure,
    targetTypeToStop: CompanyStructureTypeEnum,
    structureTree: string[]
  ): Promise<string[]> {
    const companyStructureParent = await this.companyStructureRepo.findOne({
      where: {
        id: companyStructure.id
      },
      relations: {
        companyStructureComponent: true,
        parentId: true
      },
      select: {
        id: true,
        parentId: {
          id: true,
          companyStructureComponent: { id: true, name: true, type: true }
        },
        companyStructureComponent: { id: true, name: true, type: true }
      }
    });

    if (companyStructureParent) {
      const meetTargetType =
        companyStructureParent.companyStructureComponent.type ===
        targetTypeToStop;

      if (meetTargetType) {
        return;
      }

      structureTree.push(companyStructureParent.companyStructureComponent.name);

      if (companyStructureParent.parentId) {
        await this.getCompanyStructureTreeName(
          companyStructureParent.parentId,
          targetTypeToStop,
          structureTree
        );
      }
    }
  }

  private async getTeamsByParentId(
    parentId: number,
    excludeType?: CompanyStructureTypeEnum
  ): Promise<CompanyStructure[]> {
    const teams = await this.companyStructureRepo.find({
      where: {
        parentId: { id: parentId },
        companyStructureComponent: { type: excludeType && Not(excludeType) }
      },
      relations: {
        companyStructureComponent: true,
        parentId: true
      },
      select: {
        id: true,
        parentId: {
          id: true,
          companyStructureComponent: { id: true, name: true, type: true }
        },
        companyStructureComponent: { id: true, name: true, type: true }
      }
    });

    return await this.mappingCompanyStructureResponse(
      teams,
      CompanyStructureTypeEnum.DEPARTMENT
    );
  }

  private async getCompanyStructureTeams(
    companyStructureParents: CompanyStructure[],
    companyStructureTeams: CompanyStructure[],
    excludeType = CompanyStructureTypeEnum.POSITION
  ): Promise<void> {
    for (const companyStructureParent of companyStructureParents) {
      const teams = await this.getTeamsByParentId(
        companyStructureParent.id,
        excludeType
      );
      companyStructureTeams.push(...teams);
      if (teams.length) {
        await this.getCompanyStructureTeams(
          teams,
          companyStructureTeams,
          excludeType
        );
      }
    }
  }

  private async getCompanyStructureByParentId(
    departmentId: number,
    teamsInDepartment: CompanyStructure[],
    excludeType?: CompanyStructureTypeEnum
  ) {
    const companyStructureTeams = await this.getTeamsByParentId(
      departmentId,
      excludeType
    );
    if (companyStructureTeams.length) {
      teamsInDepartment.push(...companyStructureTeams);
      await this.getCompanyStructureTeams(
        companyStructureTeams,
        teamsInDepartment,
        CompanyStructureTypeEnum.COMPANY
      );
    }
  }

  private mappingCompanyStructure(
    companyStructures: CompanyStructure[]
  ): CompanyStructureTreeDto[] | CompanyStructure[] {
    if (!companyStructures.length) {
      return companyStructures;
    }

    return companyStructures.map((team: CompanyStructure) => {
      return {
        id: team.id,
        name: team.companyStructureComponent.name,
        type: team.companyStructureComponent.type,
        nameTree: team['nameTree']
      };
    });
  }

  private async getTeamsByDepartments(
    departments: CompanyStructure[]
  ): Promise<CompanyStructure[] | CompanyStructureTreeDto[]> {
    const teams = [];
    await Promise.all(
      departments.map(async (department: CompanyStructure) => {
        await this.getCompanyStructureByParentId(department.id, teams);
      })
    );
    return this.mappingCompanyStructure(teams);
  }

  private async getSubTeams(
    pagination: PaginationQueryCompanyStructureDto,
    companyStructureData: CompanyStructure[],
    data: CompanyStructure[]
  ) {
    for (const companyStructure of companyStructureData) {
      pagination.parentId = companyStructure.id;
      const teams = await this.companyStructureRepo.find({
        where: {
          companyStructureComponent: {
            id: pagination.companyStructureComponentId,
            type: CompanyStructureTypeEnum.TEAM,
            name: pagination.name ? ILike(`%${pagination.name}%`) : null
          },
          positionLevelId: {
            levelNumber: pagination.positionLevelNumber
          },
          employeePosition: {
            employee: {
              id: pagination.employeeId
            }
          },
          fingerprintDevice: {
            id: pagination.fingerprintDeviceId
          },
          parentId: {
            id: pagination.parentId,
            companyStructureComponent: {
              type: pagination.companyComponentType
            }
          }
        },
        select: {
          id: true,
          description: true,
          address: true,
          lastRetrieveDate: true,
          isHq: true,
          structureType: true,
          parentId: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true,
              nameKh: true,
              type: true
            }
          },
          companyStructureComponent: {
            id: true,
            name: true,
            nameKh: true,
            type: true
          } as FindOptionsSelect<CompanyStructureComponent>,
          fingerprintDevice: {
            id: true,
            ipAddress: true,
            port: true,
            modelName: true
          },
          positionLevelId: {
            id: true,
            levelTitle: true,
            levelNumber: true
          } as FindOptionsSelect<PositionLevel>,
          postProbationBenefitIncrementPolicy: {
            id: true,
            name: true
          } as FindOptionsSelect<BenefitIncreasementPolicy>
        },
        relations: {
          parentId: {
            companyStructureComponent: true
          },
          positionLevelId: true,
          companyStructureComponent: true,
          fingerprintDevice: true,
          postProbationBenefitIncrementPolicy: true
        } as FindOptionsRelations<CompanyStructure>
      });
      if (teams.length) {
        data.push(...teams);
        await this.getSubTeams(pagination, teams, data);
      }
    }

    return data;
  }
}
