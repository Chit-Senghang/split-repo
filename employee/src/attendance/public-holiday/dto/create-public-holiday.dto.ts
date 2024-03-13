import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePublicHolidayDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Format (YYYY-MM-DD)'
  })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({
    type: String,
    required: true
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  bonusPercentage: number;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  description: string;
}
