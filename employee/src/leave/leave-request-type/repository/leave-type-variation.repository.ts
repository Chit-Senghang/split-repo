import { DataSource, In, Raw } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../shared-resources/exception';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { LeaveTypeVariation } from '../entities/leave-type-variation.entity';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { ILeaveTypeVariationRepository } from './interface/leave-type-variation.repository.interface';

@Injectable()
export class LeaveTypeVariationRepository
  extends RepositoryBase<LeaveTypeVariation>
  implements ILeaveTypeVariationRepository
{
  private readonly LEAVE_TYPE_VARIATION = 'leave type variation';

  constructor(readonly dataSource: DataSource) {
    super(dataSource.getRepository(LeaveTypeVariation));
  }

  async getEmployeeLeaveTypeVariationById(
    id: number,
    employee: Employee
  ): Promise<LeaveTypeVariation> {
    const leaveTypeVariation: LeaveTypeVariation =
      await this.repository.findOne({
        where: {
          employmentType: In[(employee.employmentType, 'null')],
          employeeStatus: In[(employee.employmentStatus, 'null')],
          id: id,
          genderId: { id: In[(employee.gender.id, 'null')] }
        },
        relations: { leaveType: { coverFrom: true }, genderId: true },
        select: { genderId: { id: true, value: true } }
      });

    if (!leaveTypeVariation) {
      throw new ResourceNotFoundException(this.LEAVE_TYPE_VARIATION, id);
    }

    return leaveTypeVariation;
  }

  async getLeaveTypeVariationByEmployeeAndLeaveTypeId(
    employee: Employee,
    leaveTypeId: number
  ): Promise<LeaveTypeVariation> {
    const leaveTypeVariation = await this.repository.findOne({
      where: {
        leaveType: { id: leaveTypeId },
        genderId: {
          id: Raw(
            (gender) =>
              `(${gender} IS NULL OR ${gender} = ${employee.gender.id})`
          )
        },
        employeeStatus: Raw(
          (employeeStatus) =>
            `(${employeeStatus} IS NULL OR ${employeeStatus} = '${employee.status}')`
        ),
        employmentType: Raw(
          (employmentType) =>
            `(${employmentType} IS NULL OR ${employmentType} = '${employee.employmentType}')`
        )
      },
      relations: { leaveType: true, genderId: true }
    });

    return leaveTypeVariation;
  }

  async getLeaveTypeVariationById(id: number): Promise<LeaveTypeVariation> {
    const leaveTypeVariation: LeaveTypeVariation | null =
      await this.repository.findOne({
        where: {
          id
        },
        relations: {
          leaveType: {
            leaveTypeVariation: true
          }
        },
        select: {
          id: true,
          leaveType: {
            id: true,
            leaveTypeVariation: {
              id: true
            }
          }
        }
      });
    if (!leaveTypeVariation) {
      throw new ResourceNotFoundException('leave type variation', id);
    }
    return leaveTypeVariation;
  }

  async getLeaveTypeVariationByEmployee(
    employee: Employee
  ): Promise<LeaveTypeVariation[]> {
    return this.repository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.leaveType', 'leave_type')
      .leftJoinAndSelect('leave_type.coverFrom', 'leave_type_2')
      .where('(leave.gender_id = :gender or gender_id is null)', {
        gender: employee.gender.id
      })
      .andWhere(
        '(leave.employee_status = :status or employee_status is null)',
        {
          status: employee.status
        }
      )
      .andWhere('(leave.employment_type = :type or employment_type is null)', {
        type: employee.employmentType
      })
      .getMany();
  }

  async getLeaveTypeVariationByLeaveTypeId(
    id: number
  ): Promise<LeaveTypeVariation[]> {
    return await this.repository.find({
      where: { leaveType: { id } },
      relations: { leaveType: true }
    });
  }

  async deleteLeaveTypeVariationByLeaveTypeId(
    id: number,
    leaveTypeVariationIds: number[]
  ): Promise<void> {
    //TODO: Validate leave type
    const leaveTypeVariations =
      await this.getLeaveTypeVariationByLeaveTypeId(id);

    const removeLeaveTypeVariationIds = [];
    leaveTypeVariations.forEach((leaveTypeVariation: LeaveTypeVariation) => {
      if (!leaveTypeVariationIds.includes(leaveTypeVariation.id)) {
        removeLeaveTypeVariationIds.push(leaveTypeVariation.id);
      }
    });

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.manager.delete(LeaveTypeVariation, {
        id: In(removeLeaveTypeVariationIds)
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
