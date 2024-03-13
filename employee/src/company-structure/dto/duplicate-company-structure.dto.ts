import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class DuplicateCompanyStructureDto {
  @IsNotEmpty()
  @IsBoolean()
  isIncluded: boolean;

  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsArray()
  companyStructureStoreIds: number[];
}
