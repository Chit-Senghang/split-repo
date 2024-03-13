import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { CreateRequestApprovalWorkflowLevelDto } from './create-request-approval-workflow-level.dto';

export class CreateRequestApprovalWorkflowDto {
  @IsOptional()
  @IsBoolean()
  enable: boolean;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ValidateNested()
  @IsDefined()
  @ArrayMinSize(1)
  @Type(() => CreateRequestApprovalWorkflowLevelDto)
  requesters: CreateRequestApprovalWorkflowLevelDto[];

  @IsArray()
  @ValidateNested()
  @IsDefined()
  @Type(() => CreateRequestApprovalWorkflowLevelDto)
  requestFors: CreateRequestApprovalWorkflowLevelDto[];

  @IsArray()
  @ValidateNested()
  @IsDefined()
  @ArrayMinSize(1)
  @Type(() => CreateRequestApprovalWorkflowLevelDto)
  firstApprovers: CreateRequestApprovalWorkflowLevelDto[];

  @IsArray()
  @ValidateNested()
  @IsDefined()
  @Type(() => CreateRequestApprovalWorkflowLevelDto)
  secondApprovers: CreateRequestApprovalWorkflowLevelDto[];

  @IsArray()
  @ValidateNested()
  @IsDefined()
  @Type(() => CreateRequestApprovalWorkflowLevelDto)
  acknowledgers: CreateRequestApprovalWorkflowLevelDto[];
}
