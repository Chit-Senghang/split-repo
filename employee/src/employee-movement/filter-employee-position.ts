import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { AllEmployeeConst } from '../constant/all-employee-const';
import { EmployeeInterface } from '../interface/employee-interface';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { EmployeeMovement } from './entities/employee-movement.entity';

@Injectable()
export class FilterEmployeePositionService {
  constructor(
    @InjectRepository(EmployeePosition)
    private readonly employeePositionRepo: Repository<EmployeePosition>
  ) {}

  async filterEmployeePosition(employeePositionId: number) {
    const employeePosition = await this.employeePositionRepo.findOne({
      where: {
        id: employeePositionId
      },
      relations: {
        employee: true,
        companyStructurePosition: {
          companyStructureComponent: true
        }
      }
    });
    const employeeId = employeePosition.employee.id;
    const positionId = employeePosition.companyStructurePosition.id;
    const isMoved = employeePosition.isMoved === false;
    if (employeeId && positionId && isMoved) {
      throw new ResourceConflictException(AllEmployeeConst.EMPLOYEE_POSITION);
    }
  }

  // When user movement workingShift only
  async checkNewEmployeeQualZero(
    queryRunner: QueryRunner,
    params: Pick<
      EmployeeInterface,
      'employeeId' | 'lastMovementDate' | 'newWorkingShiftId'
    >
  ) {
    const employeeMovement = await queryRunner.manager.findOne(
      EmployeeMovement,
      {
        where: {
          employee: {
            id: params.employeeId
          }
          // lastMovementDate: params.lastMovementDate
        },
        relations: {
          employee: true,
          requestMovementEmployeePosition: {
            companyStructureCompany: true
          },
          newCompanyStructurePosition: {
            companyStructureComponent: true
          }
        },
        select: {
          employee: {
            id: true,
            displayFullNameEn: true
          },
          requestMovementEmployeePosition: {
            id: true,
            companyStructurePosition: {
              id: true,
              companyStructureComponent: {
                id: true,
                name: true
              }
            }
          },
          newCompanyStructurePosition: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true
            }
          }
        }
      }
    );

    if (!employeeMovement) {
      throw new ResourceConflictException(
        AllEmployeeConst.EMPLOYEE_MOVEMENT,
        'not found'
      );
    }
    return employeeMovement;
  }
}
