import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { WorkingShift } from '../entities/working-shift.entity';
import { IWorkingShiftRepository } from './interface/working-shift.repository.interface';

@Injectable()
export class WorkingShiftRepository
  extends RepositoryBase<WorkingShift>
  implements IWorkingShiftRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(WorkingShift));
  }

  async findWorkingShiftById(id: number): Promise<WorkingShift> {
    const workingShift: WorkingShift = await this.findOne({
      where: {
        id
      }
    });
    if (!workingShift) {
      throw new ResourceNotFoundException('workingShift', id);
    }
    return workingShift;
  }
}
