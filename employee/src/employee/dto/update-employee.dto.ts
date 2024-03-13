import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Min,
  ValidateNested
} from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UpdateProbationEmployeeStatusEnum } from '../enum/employee-status.enum';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends OmitType(CreateEmployeeDto, [
  'languages',
  'trainings',
  'skills'
]) {
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageDto)
  languages: LanguageDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => TrainingDto)
  trainings: TrainingDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => SkillDto)
  skills: SkillDto[];
}

export class LanguageDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  id?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  languageId: number;
}
export class SkillDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  id?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  skillId?: number;
}
export class TrainingDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  id?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  trainingId?: number;
}

export class UpdatePostProbation {
  @IsOptional()
  @IsIn(Object.values(UpdateProbationEmployeeStatusEnum))
  passProbationStatus?: UpdateProbationEmployeeStatusEnum;

  @IsOptional()
  extendToDate?: string;
}
