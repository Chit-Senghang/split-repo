import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { BulkImportDocument } from '../../entities/bulk-import-document.entity';

export interface IBulkImportDocumentRepository
  extends IRepositoryBase<BulkImportDocument> {}
