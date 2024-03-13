import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, QueryRunner, Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { AllEmployeeConst } from '../constant/all-employee-const';
import { checkDefaultPosition } from '../shared-resources/utils/check-default-position.utils';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { EmployeeProto } from '../shared-resources/proto';
import { ValidateEmployeeService } from '../employee/validation.service';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeePositionConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';
import { CreateEmployeePositionDto } from './dto/create-employee-position.dto';
import { EmployeePosition } from './entities/employee-position.entity';
import { PaginationQueryEmployeePositionDto } from './dto/pagination-query-employee-position.dto';
import { DeleteAndInsertEmployeePositionDto } from './dto/delete-and-create-employee-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class EmployeePositionService {
  private readonly EMPLOYEE_POSITION = 'employee position';

  constructor(
    @InjectRepository(CompanyStructure)
    private readonly companyStructureRepo: Repository<CompanyStructure>,
    @InjectRepository(EmployeePosition)
    private readonly employeePositionRepo: Repository<EmployeePosition>,
    private readonly validateEmployeeService: ValidateEmployeeService,
    private readonly dataSource: DataSource,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async checkEmployeeDefaultPosition(
    employeeId: number,
    employeePositionId?: number
  ): Promise<void> {
    const employeeDefaultPosition: EmployeePosition =
      await this.employeePositionRepo.findOne({
        where: {
          id: employeePositionId && Not(employeePositionId),
          employee: {
            id: employeeId
          },
          isMoved: false,
          isDefaultPosition: true
        },
        relations: { employee: true }
      });

    if (employeeDefaultPosition) {
      throw new ResourceBadRequestException(
        'isDefaultPosition',
        'You already have a default position.'
      );
    }
  }

  checkCompanyStructureByTypeAndId = async (
    id: number,
    type: CompanyStructureTypeEnum
  ): Promise<CompanyStructure> => {
    const companyStructurePosition: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          id: id,
          companyStructureComponent: {
            type
          }
        },
        relations: {
          companyStructureComponent: true,
          parentId: true,
          positionLevelId: true
        }
      });

    if (!companyStructurePosition) {
      throw new ResourceNotFoundException(type, id);
    }

    return companyStructurePosition;
  };

  async create(
    employeeId: number,
    createEmployeePositionDto: CreateEmployeePositionDto,
    checkIsDefaultPosition: boolean,
    queryRunner?: QueryRunner
  ) {
    try {
      if (!queryRunner) {
        await this.employeeRepo.getEmployeeById(employeeId);
      }

      if (
        createEmployeePositionDto?.isDefaultPosition &&
        checkIsDefaultPosition
      ) {
        await this.checkEmployeeDefaultPosition(employeeId);
      }

      const companyStructurePosition: CompanyStructure =
        await this.checkCompanyStructureByTypeAndId(
          createEmployeePositionDto.positionId,
          CompanyStructureTypeEnum.POSITION
        );
      const companyStructureTeam: CompanyStructure =
        await this.checkCompanyStructureByTypeAndId(
          createEmployeePositionDto.teamId,
          CompanyStructureTypeEnum.TEAM
        );
      const companyStructureDepartment: CompanyStructure =
        await this.checkCompanyStructureByTypeAndId(
          createEmployeePositionDto.departmentId,
          CompanyStructureTypeEnum.DEPARTMENT
        );
      const companyStructureOutlet: CompanyStructure =
        await this.checkCompanyStructureByTypeAndId(
          createEmployeePositionDto.outletId,
          CompanyStructureTypeEnum.OUTLET
        );

      const companyStructureLocation: CompanyStructure =
        await this.checkCompanyStructureByTypeAndId(
          createEmployeePositionDto.locationId,
          CompanyStructureTypeEnum.LOCATION
        );

      const teamIds: number[] = [];
      await this.getNestedTeams(companyStructureTeam.id, teamIds);
      const mpath: string = [
        companyStructureLocation.parentId.id,
        companyStructureLocation.id,
        companyStructureOutlet.id,
        companyStructureDepartment.id,
        ...teamIds.reverse()
      ]
        .join('.')
        .concat(`.L${companyStructurePosition.positionLevelId.levelNumber}`);

      const employeePosition = this.employeePositionRepo.create({
        employee: { id: employeeId },
        isDefaultPosition: createEmployeePositionDto.isDefaultPosition,
        companyStructurePosition: {
          id: companyStructurePosition.id
        },
        companyStructureTeam: { id: companyStructureTeam.id },
        companyStructureDepartment: { id: companyStructureDepartment.id },
        companyStructureOutlet: { id: companyStructureOutlet.id },
        companyStructureLocation: { id: companyStructureLocation.id },
        companyStructureCompany: { id: companyStructureLocation.parentId.id },
        mpath
      });

      if (!queryRunner) {
        return await this.employeePositionRepo.save(employeePosition);
      }
      return await queryRunner.manager.save(employeePosition);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeePositionConstraint,
        createEmployeePositionDto
      );
    }
  }

  async findAll(
    pagination: PaginationQueryEmployeePositionDto,
    employeeId: number
  ) {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );

    return GetPagination(this.employeePositionRepo, pagination, [], {
      where: {
        employee: {
          id: employee.id
        },
        isMoved: false,
        companyStructureLocation: {
          id: pagination.locationId
        },
        companyStructureOutlet: {
          id: pagination.outletId
        },
        companyStructureDepartment: {
          id: pagination.departmentId
        },
        companyStructurePosition: {
          id: pagination.positionId
        }
      },
      select: {
        id: true,
        isDefaultPosition: true,
        mpath: true,
        employee: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true,
          accountNo: true
        },
        companyStructureCompany: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureLocation: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureOutlet: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureDepartment: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureTeam: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructurePosition: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        }
      },
      relation: {
        employee: true,
        companyStructureCompany: { companyStructureComponent: true },
        companyStructureLocation: { companyStructureComponent: true },
        companyStructureOutlet: { companyStructureComponent: true },
        companyStructureDepartment: { companyStructureComponent: true },
        companyStructureTeam: { companyStructureComponent: true },
        companyStructurePosition: { companyStructureComponent: true }
      },
      mapFunction: (employeePosition: EmployeePosition) => {
        const {
          employee,
          companyStructureCompany,
          companyStructureLocation,
          companyStructureOutlet,
          companyStructureDepartment,
          companyStructureTeam,
          companyStructurePosition,
          ...data
        } = employeePosition;

        return {
          ...data,
          employee: {
            id: employee.id,
            displayFullNameKh: employee.displayFullNameKh,
            displayFullNameEn: employee.displayFullNameEn,
            accountNo: employee.accountNo
          },
          company: {
            id: companyStructureCompany.id,
            name: companyStructureCompany.companyStructureComponent.name,
            nameKh: companyStructureCompany.companyStructureComponent.nameKh
          },
          location: {
            id: companyStructureLocation.id,
            name: companyStructureLocation.companyStructureComponent.name,
            nameKh: companyStructureLocation.companyStructureComponent.nameKh
          },
          outlet: {
            id: companyStructureOutlet.id,
            name: companyStructureOutlet.companyStructureComponent.name,
            nameKh: companyStructureOutlet.companyStructureComponent.nameKh
          },
          department: {
            id: companyStructureDepartment.id,
            name: companyStructureDepartment.companyStructureComponent.name,
            nameKh: companyStructureDepartment.companyStructureComponent.nameKh
          },
          team: {
            id: companyStructureTeam.id,
            name: companyStructureTeam.companyStructureComponent.name,
            nameKh: companyStructureTeam.companyStructureComponent.nameKh
          },
          position: {
            id: companyStructurePosition.id,
            name: companyStructurePosition.companyStructureComponent.name,
            nameKh: companyStructurePosition.companyStructureComponent.nameKh
          }
        };
      }
    });
  }

  async employeeByPosition(employeeId: number) {
    return await this.employeeRepo.getEmployeeById(employeeId);
  }

  async findOne(employeeId: number, id?: number) {
    await this.employeeRepo.getEmployeeById(employeeId);
    const employeePosition = await this.employeePositionRepo.findOne({
      where: { id },
      select: {
        employee: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true,
          accountNo: true
        },
        companyStructureCompany: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureLocation: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureOutlet: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureDepartment: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructureTeam: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        },
        companyStructurePosition: {
          id: true,
          companyStructureComponent: { id: true, name: true, nameKh: true }
        }
      },
      relations: {
        employee: true,
        companyStructureCompany: { companyStructureComponent: true },
        companyStructureLocation: { companyStructureComponent: true },
        companyStructureOutlet: { companyStructureComponent: true },
        companyStructureDepartment: { companyStructureComponent: true },
        companyStructureTeam: { companyStructureComponent: true },
        companyStructurePosition: { companyStructureComponent: true }
      }
    });
    if (!employeePosition) {
      throw new ResourceNotFoundException(this.EMPLOYEE_POSITION, id);
    }

    const newCompanyStructure = [];
    newCompanyStructure.push({
      id: employeePosition.id,
      mpath: employeePosition.mpath,
      isDefaultPosition: employeePosition.isDefaultPosition,
      employee: {
        id: employeePosition.employee.id,
        displayFullNameKh: employeePosition.employee.displayFullNameKh,
        displayFullNameEn: employeePosition.employee.displayFullNameEn,
        accountNo: employeePosition.employee.accountNo
      },
      company: {
        id: employeePosition.companyStructureCompany.id,
        name: employeePosition.companyStructureCompany.companyStructureComponent
          .name,
        nameKh:
          employeePosition.companyStructureCompany.companyStructureComponent
            .nameKh
      },
      location: {
        id: employeePosition.companyStructureLocation.id,
        name: employeePosition.companyStructureLocation
          .companyStructureComponent.name,
        nameKh:
          employeePosition.companyStructureLocation.companyStructureComponent
            .nameKh
      },
      outlet: {
        id: employeePosition.companyStructureOutlet.id,
        name: employeePosition.companyStructureOutlet.companyStructureComponent
          .name,
        nameKh:
          employeePosition.companyStructureOutlet.companyStructureComponent
            .nameKh
      },
      department: {
        id: employeePosition.companyStructureDepartment.id,
        name: employeePosition.companyStructureDepartment
          .companyStructureComponent.name,
        nameKh:
          employeePosition.companyStructureDepartment.companyStructureComponent
            .nameKh
      },
      team: {
        id: employeePosition.companyStructureTeam.id,
        name: employeePosition.companyStructureTeam.companyStructureComponent
          .name,
        nameKh:
          employeePosition.companyStructureTeam.companyStructureComponent.nameKh
      },
      position: {
        id: employeePosition.companyStructurePosition.id,
        name: employeePosition.companyStructurePosition
          .companyStructureComponent.name
      }
    });
    return newCompanyStructure;
  }

  async update(
    employeeId: number,
    id: number,
    updateEmployeePositionDto: UpdateEmployeePositionDto
  ) {
    try {
      await this.employeeRepo.getEmployeeById(employeeId);

      const oldEmployeePosition = await this.employeePositionRepo.findOne({
        where: { id },
        relations: {
          companyStructureCompany: true,
          companyStructureLocation: true,
          companyStructureOutlet: true,
          companyStructureDepartment: true,
          companyStructurePosition: { parentId: true }
        }
      });

      if (!oldEmployeePosition) {
        throw new ResourceNotFoundException('employee position', id);
      }

      if (
        updateEmployeePositionDto?.isDefaultPosition === false &&
        !!oldEmployeePosition.isDefaultPosition
      ) {
        throw new ResourceForbiddenException(
          `You are not allowed to set default position to false.`
        );
      }

      const companyStructurePosition: CompanyStructure =
        updateEmployeePositionDto?.positionId
          ? await this.checkCompanyStructureByTypeAndId(
              updateEmployeePositionDto.positionId,
              CompanyStructureTypeEnum.POSITION
            )
          : oldEmployeePosition.companyStructurePosition;

      const result = await this.findNestedStructure(
        companyStructurePosition.parentId.id
      );
      this.mpathStructure = [];

      const mpath = result
        .reverse()
        .join('.')
        .concat(`.L${companyStructurePosition.positionLevelId.levelNumber}`);
      const structure = mpath.split('.');

      updateEmployeePositionDto.positionId = companyStructurePosition.id;
      updateEmployeePositionDto.teamId = companyStructurePosition.parentId.id;
      updateEmployeePositionDto.departmentId = Number(structure[3]);
      updateEmployeePositionDto.outletId = Number(structure[2]);
      updateEmployeePositionDto.locationId = Number(structure[1]);

      const companyStructureTeam: CompanyStructure =
        updateEmployeePositionDto?.teamId
          ? await this.checkCompanyStructureByTypeAndId(
              updateEmployeePositionDto.teamId,
              CompanyStructureTypeEnum.TEAM
            )
          : oldEmployeePosition.companyStructureTeam;

      const companyStructureDepartment: CompanyStructure =
        updateEmployeePositionDto?.departmentId
          ? await this.checkCompanyStructureByTypeAndId(
              updateEmployeePositionDto.departmentId,
              CompanyStructureTypeEnum.DEPARTMENT
            )
          : oldEmployeePosition.companyStructureDepartment;
      const companyStructureOutlet: CompanyStructure =
        updateEmployeePositionDto?.outletId
          ? await this.checkCompanyStructureByTypeAndId(
              updateEmployeePositionDto.outletId,
              CompanyStructureTypeEnum.OUTLET
            )
          : oldEmployeePosition.companyStructureOutlet;

      const companyStructureLocation: CompanyStructure =
        updateEmployeePositionDto?.locationId
          ? await this.checkCompanyStructureByTypeAndId(
              updateEmployeePositionDto.locationId,
              CompanyStructureTypeEnum.LOCATION
            )
          : oldEmployeePosition.companyStructureLocation;

      const newEmployeePosition = Object.assign(oldEmployeePosition, {
        companyStructureDepartment: {
          id: companyStructureDepartment?.id
        },
        companyStructurePosition: {
          id: companyStructurePosition?.id
        },
        companyStructureOutlet: {
          id: companyStructureOutlet?.id
        },
        companyStructureLocation: {
          id: companyStructureLocation?.id
        },
        companyStructureTeam: {
          id: companyStructureTeam?.id
        },
        companyStructureCompany: {
          id: companyStructureDepartment?.parentId?.id
        },
        ...updateEmployeePositionDto,
        mpath
      });
      return this.employeePositionRepo.save(newEmployeePosition);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeePositionConstraint,
        updateEmployeePositionDto
      );
    }
  }

  mpathStructure = [];

  findNestedStructure = async (parentId: number) => {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: { id: parentId },
      relations: {
        companyStructureComponent: true,
        parentId: { companyStructureComponent: true }
      }
    });
    if (!companyStructure) {
      throw new ResourceNotFoundException('company structure', parentId);
    }
    this.mpathStructure.push(parentId);

    if (
      companyStructure.companyStructureComponent.type !==
      CompanyStructureTypeEnum.COMPANY
    ) {
      await this.findNestedStructure(companyStructure.parentId.id);
    }
    return this.mpathStructure;
  };

  async updateEmployeePosition(
    employeeId: number,
    deleteAndInsertEmployeePositionDto: DeleteAndInsertEmployeePositionDto
  ) {
    let createEmployeePosition: EmployeePosition;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    checkDefaultPosition(deleteAndInsertEmployeePositionDto.positions);
    const employee = await this.employeeRepo.getEmployeeById(employeeId);
    try {
      const existingPositions = await this.findEmployeePosition(
        employee.id,
        deleteAndInsertEmployeePositionDto.positions,
        true
      );
      if (!existingPositions) {
        throw new ResourceNotFoundException(AllEmployeeConst.EMPLOYEE_POSITION);
      }

      existingPositions.forEach(async ({ id }) => {
        await queryRunner.manager.softDelete(EmployeePosition, {
          id
        });
      });

      const lastExistingEmployeePosition = await this.findEmployeePosition(
        employee.id,
        deleteAndInsertEmployeePositionDto.positions,
        false
      );

      const companyStructurePositionIds: UpdatePositionDto[] = [];
      deleteAndInsertEmployeePositionDto.positions.forEach(
        (item: UpdatePositionDto) => {
          const duplicatePosition = lastExistingEmployeePosition.find(
            (element: EmployeePosition) => {
              if (element.id === item.employeePositionId) {
                return element;
              }
            }
          );
          if (!duplicatePosition) {
            companyStructurePositionIds.push(item);
          }
        }
      );
      for (const position of companyStructurePositionIds) {
        const companyStructurePosition = await this.getCompanyStructureByType(
          position.employeePositionId,
          CompanyStructureTypeEnum.POSITION,
          {
            parentId: {
              companyStructureComponent: true
            },
            companyStructureComponent: true,
            positionLevelId: true
          }
        );
        if (
          companyStructurePosition.companyStructureComponent.type !==
          CompanyStructureTypeEnum.POSITION
        ) {
          throw new ResourceNotFoundException(
            `Resource of ${position.employeePositionId} is not type of position`
          );
        }
        const result = await this.findNestedStructure(
          companyStructurePosition.parentId.id
        );

        this.mpathStructure = [];
        const mpath = result
          .reverse()
          .join('.')
          .concat(`.L${companyStructurePosition.positionLevelId.levelNumber}`);
        const structure = mpath.split('.');

        const storeInCompanyStructure = await this.getCompanyStructureByType(
          Number(structure[2]),
          CompanyStructureTypeEnum.OUTLET,
          {
            companyStructureComponent: true,
            positionLevelId: true
          }
        );
        employee.positions.forEach((employeePosition) => {
          if (
            employeePosition.companyStructureOutlet.id ===
            storeInCompanyStructure.id
          ) {
            throw new ResourceForbiddenException(
              AllEmployeeConst.EMPLOYEE_POSITION_DUPLICATE_STORE
            );
          }
        });

        const createEmployeePositionDto = {
          positionId: position.employeePositionId,
          isDefaultPosition: position.isDefaultPosition,
          teamId: companyStructurePosition.parentId.id,
          departmentId: Number(structure[3]),
          outletId: Number(structure[2]),
          locationId: Number(structure[1])
        } as const;
        createEmployeePosition = await this.create(
          employeeId,
          createEmployeePositionDto,
          false,
          queryRunner
        );
      }

      await queryRunner.commitTransaction();
      for (const employeePosition of lastExistingEmployeePosition) {
        const filterExistingWithDto =
          deleteAndInsertEmployeePositionDto.positions.filter((dto) => {
            if (
              employeePosition.employee.positions.filter(
                (existingPosition) =>
                  dto.employeePositionId === existingPosition.id &&
                  dto.isDefaultPosition === existingPosition.isDefaultPosition
              ).length
            ) {
              return dto;
            }
          });
        if (!filterExistingWithDto.length) {
          await queryRunner.manager.find(EmployeePosition, {
            where: {
              id: employeePosition.id,
              isDefaultPosition: true
            }
          });
          await queryRunner.manager.save(
            Object.assign(employeePosition, {
              isDefaultPosition: false
            })
          );
        }
      }

      return { id: createEmployeePosition.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number, employeeId: number) {
    await this.employeeRepo.getEmployeeById(employeeId);
    const employeePosition = await this.findEmployeePositionById(id);
    if (employeePosition.isDefaultPosition) {
      throw new ResourceForbiddenException(
        'isDefaultPosition',
        'You can not delete the default position.'
      );
    }
    await this.employeePositionRepo.softDelete(id);
  }

  async switchDefaultPosition(id: number, employeeId: number) {
    await this.employeeRepo.getEmployeeById(employeeId);
    const employeePosition = await this.findEmployeePositionById(id);
    if (employeePosition) {
      return await this.employeePositionRepo.save(
        Object.assign(employeePosition, {
          isDefaultPosition: true
        })
      );
    }
  }

  async findEmployeePositionById(id: number) {
    const employeePosition = await this.employeePositionRepo.findOne({
      where: {
        id
      },
      select: {
        id: true,
        isDefaultPosition: true
      }
    });
    if (!employeePosition) {
      throw new ResourceNotFoundException(
        AllEmployeeConst.EMPLOYEE_POSITION,
        id
      );
    }
    return employeePosition;
  }

  async grpcGetEmployeePositionByEmployeeId(
    employeeId: EmployeeProto.EmployeeId
  ) {
    const employeePosition = await this.employeePositionRepo.findOne({
      where: { employee: { id: employeeId.employeeId } },
      relations: {
        companyStructureCompany: { companyStructureComponent: true },
        companyStructurePosition: { positionLevelId: true },
        companyStructureDepartment: { companyStructureComponent: true },
        companyStructureOutlet: { companyStructureComponent: true }
      }
    });
    if (!employeePosition) {
      throw new RpcException({
        message: `Employee position of employee ${employeeId.employeeId} not found`,
        code: 5
      });
    }
    return {
      id: employeePosition.id,
      isDefaultPosition: employeePosition.isDefaultPosition,
      companyStructureId: employeePosition?.companyStructureCompany?.id,
      department:
        employeePosition?.companyStructureDepartment?.companyStructureComponent
          ?.name,
      positionLevelId:
        employeePosition?.companyStructurePosition?.positionLevelId?.id,
      levelTitle:
        employeePosition?.companyStructurePosition?.positionLevelId?.levelTitle,
      levelNumber:
        employeePosition?.companyStructurePosition?.positionLevelId
          ?.levelNumber,
      outlet:
        employeePosition?.companyStructureOutlet?.companyStructureComponent
          ?.name
    };
  }

  async getCompanyStructureByType(
    id: number,
    type: CompanyStructureTypeEnum,
    relations: object
  ) {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: {
        id,
        companyStructureComponent: { type }
      },
      relations
    });

    if (!companyStructure) {
      throw new ResourceNotFoundException(`company structure ${type}`, id);
    }

    return companyStructure;
  }

  async findEmployeePosition(
    employeeId: number,
    employeePositions: UpdatePositionDto[],
    isNotIn: boolean
  ) {
    return await this.employeePositionRepo.find({
      where: {
        id: isNotIn
          ? Not(
              In(
                employeePositions.map((position) => position.employeePositionId)
              )
            )
          : In(
              employeePositions.map((position) => position.employeePositionId)
            ),
        employee: {
          id: employeeId,
          positions: {
            isMoved: false
          }
        }
      },
      relations: {
        employee: {
          positions: true
        }
      }
    });
  }

  // ==================== [Private block] ====================
  private async getNestedTeams(
    teamId: number,
    teamIds: number[]
  ): Promise<number[]> {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: {
        id: teamId,
        companyStructureComponent: {
          type: CompanyStructureTypeEnum.TEAM
        }
      },
      relations: {
        parentId: {
          companyStructureComponent: true
        },
        companyStructureComponent: true
      },
      select: {
        id: true,
        companyStructureComponent: {
          id: true,
          type: true
        },
        parentId: {
          id: true,
          companyStructureComponent: {
            id: true,
            type: true
          }
        }
      }
    });

    if (!companyStructure) {
      return;
    }

    teamIds.push(companyStructure.id);

    if (
      companyStructure.parentId &&
      companyStructure.companyStructureComponent.type ===
        CompanyStructureTypeEnum.TEAM
    ) {
      await this.getNestedTeams(companyStructure.parentId.id, teamIds);
    }

    return teamIds;
  }
}
