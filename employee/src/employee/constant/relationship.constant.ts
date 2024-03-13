import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { Employee } from '../entity/employee.entity';

export const EMPLOYEE_RELATIONSHIP = {
  contacts: true,
  workingShiftId: {
    workshiftType: true
  },
  gender: true,
  positions: {
    employee: true,
    companyStructureCompany: {
      companyStructureComponent: true
    },
    companyStructureLocation: {
      companyStructureComponent: true
    },
    companyStructureOutlet: {
      companyStructureComponent: true
    },
    companyStructureDepartment: {
      companyStructureComponent: true
    },
    companyStructureTeam: {
      companyStructureComponent: true
    },
    companyStructurePosition: {
      companyStructureComponent: true,
      positionLevelId: true
    }
  }
} as FindOptionsRelations<Employee>;
