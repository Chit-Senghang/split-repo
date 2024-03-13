import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateBenefitComponentDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'name is string'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    type: String
  })
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value.trim())
  nameKhmer: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'benefitComponentTypeId is number'
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  benefitComponentTypeId: number;

  @IsBoolean()
  isFixed: boolean = false;
}
