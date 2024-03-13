import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { BorrowOrPaybackRequest } from '../entities/borrow-or-payback.entity';
import { IBorrowOrPayBackRequestRepository } from './interface/borrow-or-payback-request.repository.interface';

@Injectable()
export class BorrowOrPayBackRequestRepository
  extends RepositoryBase<BorrowOrPaybackRequest>
  implements IBorrowOrPayBackRequestRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(BorrowOrPaybackRequest));
  }
}
