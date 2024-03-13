import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateApprovalStatusTrackingDto {
  @IsOptional()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsBoolean()
  approvalResult: boolean;
}
