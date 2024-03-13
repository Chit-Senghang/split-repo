import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CompanyStructureTypeEnum } from '../../common/ts/enum/structure-type.enum';

export class CreateCompanyStructureComponentDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString()
  nameKh: string;

  @IsNotEmpty()
  @IsIn(Object.values(CompanyStructureTypeEnum))
  type: CompanyStructureTypeEnum;

  @IsOptional()
  @IsInt()
  @Min(1)
  postProbationBenefitIncrementPolicyId: number;
}
