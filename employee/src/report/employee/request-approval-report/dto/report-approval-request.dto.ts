import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReportApprovalRequestDto {
  data: ReportApprovalRequestTemplateDto;
}
export class ReportApprovalRequestTemplateDto {
  @IsInt()
  @IsNotEmpty()
  reportId: number;

  @IsInt()
  @IsNotEmpty()
  totalRequestCount: number;
}

export class ReportApprovalRequestQueryDto {
  @IsOptional()
  @IsString()
  createdAt: string;
}
