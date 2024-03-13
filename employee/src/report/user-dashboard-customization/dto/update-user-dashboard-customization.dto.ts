import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  ValidateNested
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUserDashboardCustomizationDto } from './create-user-dashboard-customization.dto';

export class UpdateUserDashboardCustomizationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ always: true })
  @Type(() => UserDashboardCustomizationDto)
  dashboards: UserDashboardCustomizationDto[];
}

class UserDashboardCustomizationDto extends OmitType(
  CreateUserDashboardCustomizationDto,
  ['reportId']
) {
  @ApiProperty({ required: true, type: Number })
  @IsNotEmpty()
  @IsInt()
  id: number;
}
