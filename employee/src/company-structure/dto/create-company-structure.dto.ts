import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

export class CreateCompanyStructureDto {
  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  lastRetrieveDate: Date;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  postProbationBenefitIncrementPolicyId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  positionLevelId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  fingerprintDeviceId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  companyStructureComponentId: number;

  @IsBoolean()
  @IsOptional()
  isHq: boolean;
}
