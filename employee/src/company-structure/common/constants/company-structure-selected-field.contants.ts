import { FindOptionsSelect } from 'typeorm';
import { CompanyStructure } from '../../entities/company-structure.entity';

export const COMPANY_STRUCTURE_SELECTED_FIELDS = {
  id: true,
  companyStructureComponent: {
    id: true,
    name: true,
    nameKh: true,
    type: true
  },
  positionLevelId: {
    id: true,
    levelNumber: true,
    levelTitle: true
  },
  children: { id: true }
} as FindOptionsSelect<CompanyStructure>;
