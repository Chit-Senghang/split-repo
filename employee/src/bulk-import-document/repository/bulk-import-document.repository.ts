import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { BulkImportDocument } from '../entities/bulk-import-document.entity';
import { IBulkImportDocumentRepository } from './interface/bulk-import-document.repository.interface';

@Injectable()
export class BulkImportDocumentRepository
  extends RepositoryBase<BulkImportDocument>
  implements IBulkImportDocumentRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(BulkImportDocument));
  }
}
