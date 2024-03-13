import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min
} from 'class-validator';
import { AccessAttemptEnum } from '../common/ts/enums/access-attempt-type.enum';

export class CreateAccessAttemptDto {
  @IsString()
  @IsOptional()
  ipAddress: string;

  @IsBoolean()
  @IsOptional()
  isSuccess: boolean;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(AccessAttemptEnum))
  type: AccessAttemptEnum;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsString()
  deviceDetail: string;
}
