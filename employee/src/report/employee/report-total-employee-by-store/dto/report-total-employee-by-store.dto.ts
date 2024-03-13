import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ReportTotalEmployeeByStoreDto {
  data: ReportTotalEmployeeByStoreTemplateDto;
}

export class ReportTotalEmployeeByStoreTemplateDto {
  @IsInt()
  @IsNotEmpty()
  reportId: number;

  @IsInt()
  @IsNotEmpty()
  totalCount: number;

  @IsArray()
  locations: LocationTemplateDto[];
}

export class LocationTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  totalCount: number;

  @IsArray()
  outlets: OutletTemplateDto[];
}

export class OutletTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  totalCount: number;
}
