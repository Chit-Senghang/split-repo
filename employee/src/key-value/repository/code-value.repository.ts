import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { CodeValue } from '../entity';
import { ICodeValueRepository } from './interface/code-value.interface';

@Injectable()
export class CodeValueRepository
  extends RepositoryBase<CodeValue>
  implements ICodeValueRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(CodeValue));
  }
}
