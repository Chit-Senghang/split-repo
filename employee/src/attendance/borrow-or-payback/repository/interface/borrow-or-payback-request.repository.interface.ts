import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { BorrowOrPaybackRequest } from '../../entities/borrow-or-payback.entity';

export interface IBorrowOrPayBackRequestRepository
  extends IRepositoryBase<BorrowOrPaybackRequest> {}
