import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { CodeTypesEnum } from '../key-value/ts/enums/permission.enum';
import { Code, CodeValue } from '../key-value/entity';
import { AllEmployeeConst } from '../constant/all-employee-const';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { ApprovalStatusEnum } from '../approval-status-tracking/common/ts/enum/approval-status.enum';
import { IWorkingShiftRepository } from '../workshift-type/repository/interface/working-shift.repository.interface';
import { WorkingShiftRepository } from '../workshift-type/repository/working-shift.repository';
import { EmployeeMovement } from './entities/employee-movement.entity';
import { UpdateEmployeeMovementDto } from './dto/update-employee-movement.dto';

export class EmployeeMovementValidationService {
  private readonly EMPLOYEE_MOVEMENT = 'employee movement';

  constructor(
    @InjectRepository(EmployeePosition)
    private readonly employeePositionRepo: Repository<EmployeePosition>,
    @InjectRepository(CompanyStructure)
    private readonly companyStructureRepo: Repository<CompanyStructure>,
    @InjectRepository(CodeValue)
    private readonly codeValueRepo: Repository<CodeValue>,
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
    @InjectRepository(EmployeeMovement)
    private readonly employeeMovementRepo: Repository<EmployeeMovement>,
    @Inject(WorkingShiftRepository)
    private readonly workshiftRepository: IWorkingShiftRepository
  ) {}

  //* Employee Position
  async getCurrentPositionById(id: number) {
    const employeePosition = await this.employeePositionRepo.findOne({
      where: {
        id,
        employee: {
          positions: {
            isMoved: false
          }
        }
      },
      relations: {
        employee: {
          positions: {
            companyStructureLocation: true,
            companyStructureOutlet: true,
            companyStructureDepartment: true,
            companyStructurePosition: {
              positionLevelId: true
            }
          }
        }
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

  async validateGetRequestPreviousEmployeePositionByCurrentUserLogin(
    id: number
  ) {
    return await this.employeePositionRepo.find({
      where: {
        createdBy: id
      },
      select: {
        employee: {
          id: true,
          workingShiftId: {
            id: true,
            name: true
          }
        }
      },
      relations: {
        employee: {
          workingShiftId: true
        },
        companyStructureCompany: true,
        companyStructureLocation: {
          companyStructureComponent: true
        },
        companyStructureOutlet: {
          companyStructureComponent: true
        },
        companyStructureDepartment: {
          companyStructureComponent: true
        },
        companyStructurePosition: {
          companyStructureComponent: true
        }
      } as FindOptionsRelations<EmployeePosition>
    });
  }

  //* Company Structure
  async getCompanyStructurePositionById(id: number) {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: {
        id
      }
    });
    if (!companyStructure) {
      throw new ResourceNotFoundException(
        AllEmployeeConst.COMPANY_STRUCTURE,
        id
      );
    }
    return companyStructure;
  }

  async getCompanyStructureByType(id: number, type: CompanyStructureTypeEnum) {
    const companyStructure = await this.companyStructureRepo.findOne({
      where: {
        id,
        companyStructureComponent: { type }
      },
      relations: { companyStructureComponent: true, positionLevelId: true }
    });

    if (!companyStructure) {
      throw new ResourceNotFoundException(`company structure ${type}`, id);
    }

    return companyStructure;
  }

  async checkWarningType(id: number): Promise<Code> {
    const movementType = await this.codeValueRepo.findOne({
      where: { id },
      relations: { codeId: true }
    });
    if (!movementType) {
      throw new ResourceNotFoundException(AllEmployeeConst.MOVEMENT, id);
    }
    const type = await this.codeRepo.findOne({
      where: { id: movementType.codeId.id }
    });
    if (type.code !== CodeTypesEnum.MOVEMENT) {
      throw new ResourceNotFoundException(
        `Resource of ${id} is not type of ${CodeTypesEnum.WARNING_TYPE}`
      );
    }
    return type;
  }

  async getEmployeePositionById(id: number) {
    const employeePosition = await this.employeePositionRepo.findOne({
      where: {
        id
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

  async findOneById(id: number) {
    const employeeMovement = await this.employeeMovementRepo.findOne({
      select: {
        employee: {
          id: true,
          firstNameEn: true,
          lastNameEn: true
        }
      },
      where: { id },
      relations: {
        employee: true,
        newCompanyStructurePosition: true,
        previousCompanyStructurePosition: true,
        requestMovementEmployeePosition: true,
        newWorkingShiftId: true
      }
    });
    if (!employeeMovement) {
      throw new ResourceNotFoundException(this.EMPLOYEE_MOVEMENT, id);
    }
    return employeeMovement;
  }

  checkStatusActive(status: string) {
    if (status === ApprovalStatusEnum.ACTIVE) {
      throw new ResourceForbiddenException(
        `You can't update this record because status is active`
      );
    }
  }

  // this function validate
  async validateUpdateMovingPosition(
    employeeMovement: EmployeeMovement,
    updateEmployeeMovementDto: UpdateEmployeeMovementDto
  ) {
    if (
      updateEmployeeMovementDto.requestMovementEmployeePositionId &&
      updateEmployeeMovementDto.previousCompanyStructurePositionId &&
      updateEmployeeMovementDto.newCompanyStructurePositionId
    ) {
      if (
        !employeeMovement.requestMovementEmployeePosition?.id ||
        !employeeMovement.previousCompanyStructurePosition?.id ||
        !employeeMovement.newCompanyStructurePosition?.id
      ) {
        throw new ResourceForbiddenException(
          'movePosition',
          'You can not update data that you did not create.'
        );
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
