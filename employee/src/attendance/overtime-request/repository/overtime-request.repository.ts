import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResourceNotFoundException } from '../../../shared-resources/exception';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { OvertimeRequest } from '../entities/overtime-request.entity';
import { IOvertimeRequestRepository } from './interface/overtime-request.repository.interface';

@Injectable()
export class OvertimeRequestRepository
  extends RepositoryBase<OvertimeRequest>
  implements IOvertimeRequestRepository
{
  private readonly OVERTIME_REQUEST: string = 'Overtime request';

  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(OvertimeRequest));
  }

  FindOneById(
    id: number,
    isValidate?: boolean
  ): Promise<OvertimeRequest | null> {
    const overtimeRequest = this.findOne({
      where: {
        id
      }
    });

    if (!overtimeRequest && isValidate) {
      throw new ResourceNotFoundException(this.OVERTIME_REQUEST, id);
    }

    return overtimeRequest;
  }
}
