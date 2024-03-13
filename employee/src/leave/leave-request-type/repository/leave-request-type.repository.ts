import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { LeaveType } from '../entities/leave-type.entity';
import { ILeaveRequestTypeRepository } from './interface/leave-request-type.repository.interface';

@Injectable()
export class LeaveRequestTypeRepository
  extends RepositoryBase<LeaveType>
  implements ILeaveRequestTypeRepository
{
  constructor(readonly dataSource: DataSource) {
    super(dataSource.getRepository(LeaveType));
  }
}
