import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Geographic } from '../entities/geographic.entity';
import { IGeographicRepository } from './interface/geographic.repository.interface';

@Injectable()
export class GeographicRepository
  extends RepositoryBase<Geographic>
  implements IGeographicRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Geographic));
  }
}
