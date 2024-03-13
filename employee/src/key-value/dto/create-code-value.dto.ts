import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCodeValueDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  identifier: string;
}
