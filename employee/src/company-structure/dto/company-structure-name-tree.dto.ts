import { CompanyStructureTypeEnum } from '../common/ts/enum/structure-type.enum';

export class CompanyStructureTreeDto {
  id: number;

  name: string;

  type: CompanyStructureTypeEnum;

  nameTree: string;
}
