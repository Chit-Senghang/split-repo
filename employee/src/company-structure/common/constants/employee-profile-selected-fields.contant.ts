import { FindOptionsSelect } from 'typeorm';
import { CompanyStructure } from '../../entities/company-structure.entity';

export const EMPLOYEE_PROFILE_SELECTED_FIELDS = {
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
  employeePosition: {
    id: true,
    isMoved: true,
    isDefaultPosition: true,
    companyStructurePosition: { id: true },
    employee: {
      id: true,
      displayFullNameEn: true,
      status: true
    }
  },
  children: { id: true }
} as FindOptionsSelect<CompanyStructure>;
