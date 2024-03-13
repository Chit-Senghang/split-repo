import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Code } from '../entity';
import { ICodeRepository } from './interface/code.repository.interface';

@Injectable()
export class CodeRepository
  extends RepositoryBase<Code>
  implements ICodeRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Code));
  }
}
