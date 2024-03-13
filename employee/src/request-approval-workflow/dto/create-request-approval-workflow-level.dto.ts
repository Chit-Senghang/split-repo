import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min
} from 'class-validator';
import { ReasonTemplateTypeEnum } from '../../reason-template/common/ts/enum/type.enum';

export class CreateRequestApprovalWorkflowLevelDto {
  @IsInt()
  @IsNotEmpty()
  positionLevelId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  companyStructureDepartmentId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  companyStructureTeamId: number;

  @IsString()
  @IsOptional()
  @IsIn(Object.values(ReasonTemplateTypeEnum))
  type: ReasonTemplateTypeEnum;

  @IsInt()
  @IsOptional()
  requestApprovalWorkflowId: number;
}
