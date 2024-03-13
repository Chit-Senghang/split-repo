import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional
} from 'class-validator';
import { BulkTypeEnum } from '../enum/type.enum';

export class CreateBulkImportDocumentDto {
  @IsNotEmpty()
  @IsIn(Object.values(BulkTypeEnum))
  type: BulkTypeEnum;

  @IsDate()
  @IsOptional()
  importEndDate: Date;

  @IsDate()
  @IsOptional()
  importStartDate: Date;

  @IsNotEmpty()
  @IsBoolean()
  isCompleted: boolean;

  @IsInt()
  @IsNotEmpty()
  totalRecord: number;

  @IsInt()
  @IsNotEmpty()
  failureCount: number;

  @IsInt()
  @IsNotEmpty()
  successCount: number;
}
