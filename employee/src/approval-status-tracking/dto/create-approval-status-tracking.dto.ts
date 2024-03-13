import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';
import { ApprovalStatusEnum } from '../common/ts/enum/approval-status.enum';

export class CreateApprovalStatusTrackingDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  approvalWorkflowId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  requestWorkflowTypeId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  entityId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  requestToUpdateBy: number;

  @IsOptional()
  @IsString()
  requestChangeOriginalJson?: string;

  @IsOptional()
  @IsString()
  employeeInfo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  requestToUpdateJson: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  requestToUpdateChange: string;

  @IsOptional()
  @IsInt()
  firstApprovalUserId: number;

  @IsOptional()
  @IsInt()
  secondApprovalUserId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  status: ApprovalStatusEnum;
}
