import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  entityId: number;

  @IsOptional()
  @IsInt()
  approvalStatusId: number;

  @IsNotEmpty()
  entityType: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
