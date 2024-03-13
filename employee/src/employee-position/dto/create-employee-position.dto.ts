import { IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateEmployeePositionImportDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  positionId?: number;

  @IsNotEmpty()
  @IsBoolean()
  isDefaultPosition: boolean;
}

export class CreateEmployeePositionDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  locationId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  outletId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  departmentId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  teamId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  positionId: number;

  @IsNotEmpty()
  @IsBoolean()
  isDefaultPosition: boolean;
}
