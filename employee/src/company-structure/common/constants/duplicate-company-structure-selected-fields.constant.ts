import { FindOptionsSelect } from 'typeorm';
import { CompanyStructure } from '../../entities/company-structure.entity';

export const DUPLICATE_COMPANY_STRUCTURE_DEPARTMENT_SELECTED_FIELDS = {
  id: true,
  companyStructureComponent: {
    id: true
  },
  positionLevelId: {
    id: true
  },
  fingerprintDevice: {
    id: true
  },
  children: { id: true }
} as FindOptionsSelect<CompanyStructure>;
