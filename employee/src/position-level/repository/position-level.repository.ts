import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PositionLevel } from '../entities/position-level.entity';
import { IPositionLevelRepository } from './interface/position-level.repository.interface';

@Injectable()
export class PositionLevelRepository
  extends RepositoryBase<PositionLevel>
  implements IPositionLevelRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PositionLevel));
  }
}
