import { DataSource, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeMovement } from '../entities/employee-movement.entity';
import { EmployeeMovementStatusEnum } from '../ts/enums/movement-status.enum';
import { IEmployeeMovementRepository } from './interface/employee-movement.repository.interface';

@Injectable()
export class EmployeeMovementRepository
  extends RepositoryBase<EmployeeMovement>
  implements IEmployeeMovementRepository
{
  private readonly EMPLOYEE_MOVEMENT = 'employee movement';

  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeMovement));
  }

  async getEmployeeMovementWithNotFound(id: number): Promise<EmployeeMovement> {
    const employeeMovement: EmployeeMovement | null = await this.findOne({
      where: { id },
      relations: { employee: true }
    });
    if (!employeeMovement) {
      throw new ResourceNotFoundException('employee movement', id);
    }
    return employeeMovement;
  }

  async getEmployeeLastMovement(employeeId: number): Promise<EmployeeMovement> {
    return await this.findOne({
      where: {
        employee: { id: employeeId },
        status: In([
          EmployeeMovementStatusEnum.ACTIVE,
          EmployeeMovementStatusEnum.IN_SCHEDULE
        ])
      },
      relations: { employee: true },
      select: { employee: { id: true } },
      order: {
        id: 'DESC'
      }
    });
  }
}
