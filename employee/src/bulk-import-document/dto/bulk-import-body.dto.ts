import { IsIn, IsNotEmpty } from 'class-validator';
import { BulkTypeEnum } from '../enum/type.enum';

export class BulkImportBodyDto {
  @IsNotEmpty()
  @IsIn(Object.values(BulkTypeEnum))
  entityType: BulkTypeEnum;
}
