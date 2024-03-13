import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBenefitAdjustmentTypeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
