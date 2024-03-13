import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGlobalConfigurationDto {
  @IsOptional()
  @IsBoolean()
  isEnable: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  value: string;

  @IsOptional()
  @IsString()
  description: string;
}
