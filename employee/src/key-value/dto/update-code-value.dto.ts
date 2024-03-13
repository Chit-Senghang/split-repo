import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCodeValueDto } from './create-code-value.dto';

export class UpdateCodeValueDto extends PartialType(CreateCodeValueDto) {
  @IsBoolean()
  @IsOptional()
  isEnabled: boolean;
}
