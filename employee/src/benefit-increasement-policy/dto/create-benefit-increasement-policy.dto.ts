import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator';

export class CreateBenefitIncreasementPolicyDto {
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @ValidateNested()
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateBenefitIncreasementPolicyDetailDto)
  detail: CreateBenefitIncreasementPolicyDetailDto[];
}

export class CreateBenefitIncreasementPolicyDetailDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  benefitComponentId: number;

  @IsNotEmpty()
  @IsNumber()
  increasementAmount: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description: string;
}
