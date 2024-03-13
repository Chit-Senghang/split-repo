import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Nssf } from '../entities/nssf.entity';
import { INssfRepository } from './interface/nssf.repository.interface';

@Injectable()
export class NssfRepository
  extends RepositoryBase<Nssf>
  implements INssfRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Nssf));
  }
}
