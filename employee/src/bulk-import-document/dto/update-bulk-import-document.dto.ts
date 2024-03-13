import { PartialType } from '@nestjs/swagger';
import { CreateBulkImportDocumentDto } from './create-bulk-import-document.dto';

export class UpdateBulkImportDocumentDto extends PartialType(
  CreateBulkImportDocumentDto
) {}
