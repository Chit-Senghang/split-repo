import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../shared-resources/exception';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { LeaveType } from '../entities/leave-type.entity';
import { ILeaveTypeRepository } from './interface/leave-type.repository.interface';

@Injectable()
export class LeaveTypeRepository
  extends RepositoryBase<LeaveType>
  implements ILeaveTypeRepository
{
  private readonly LEAVE_TYPE = 'Leave type';

  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(LeaveType));
  }

  async getLeaveTypeById(id: number): Promise<LeaveType> {
    const leaveType = await this.repository.findOne({
      where: { id },
      relations: { leaveTypeVariation: { genderId: true }, coverFrom: true }
    });
    if (!leaveType) {
      throw new ResourceNotFoundException(this.LEAVE_TYPE, id);
    }
    return leaveType;
  }
}
