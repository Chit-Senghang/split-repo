import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExportDataTypeEnum } from '../../shared-resources/export-file/common/enum/export.enum';

export class QueryJobSchedulerLogExportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(ExportDataTypeEnum))
  exportFileType: ExportDataTypeEnum;
}
