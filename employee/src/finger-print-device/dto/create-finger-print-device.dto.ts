import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFingerPrintDeviceDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsString()
  modelName: string;

  @IsNotEmpty()
  @IsString()
  ipAddress: string;

  @IsString()
  @IsOptional()
  specification: string;

  @IsNotEmpty()
  @IsInt()
  port: number;
}
