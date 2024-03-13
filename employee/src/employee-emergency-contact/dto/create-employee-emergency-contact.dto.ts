import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Validate
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PhoneValidator } from '../../shared-resources/common/utils/custom-validate-phone-number';

export class CreateEmployeeEmergencyContactDto {
  @ApiPropertyOptional({ type: String })
  @IsNotEmpty({ message: 'emergency contact should not be empty.' })
  @IsString()
  @Validate(PhoneValidator)
  @Transform(({ obj }) => obj?.contact?.replace(/\s+/g, ''))
  contact: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @Min(1)
  contactRelationshipId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
