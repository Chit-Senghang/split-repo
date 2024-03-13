import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
// import { CompanyStructure } from '../employee/src/company-structure/entities/company-structure.entity';
// import { EmployeePosition } from '../../../../employee/src/employee-position/entities/employee-position.entity';
// import { Employee } from '../../../../employee/src/employee/entity/employee.entity';

export const customSelectPositionAndTeam = {
  id: true,
  email: true,
  displayFullNameEn: true,
  dob: true,
  startDate: true,
  accountNo: true,
  gender: { id: true, value: true },
  maritalStatus: { id: true, value: true },
  positions: {
    id: true,
    isDefaultPosition: true,
    mpath: true,
    companyStructureCompany: {
      companyStructureComponent: {
        id: true,
        name: true
      }
    },
    companyStructurePosition: {
      id: true,
      isHq: true,
      companyStructureComponent: {
        id: true,
        name: true
      }
    },
    companyStructureOutlet: {
      id: true,
      companyStructureComponent: {
        id: true,
        name: true
      }
    },
    companyStructureDepartment: {
      id: true,
      companyStructureComponent: {
        id: true,
        name: true
      }
    },
    companyStructureTeam: {
      id: true,
      companyStructureComponent: {
        id: true,
        name: true
      }
    },
    companyStructureLocation: {
      id: true,
      companyStructureComponent: {
        id: true,
        name: true
      }
    }
  }
} as FindOptionsSelect<any>;

export const customRelationPositionAndTeam = {
  gender: true,
  maritalStatus: true,
  contacts: true,
  positions: {
    companyStructurePosition: {
      companyStructureComponent: true,
      positionLevelId: true
    },
    companyStructureOutlet: {
      companyStructureComponent: true
    },
    companyStructureDepartment: {
      companyStructureComponent: true
    },
    companyStructureLocation: {
      companyStructureComponent: true
    },
    companyStructureTeam: {
      companyStructureComponent: true
    }
  }
} as FindOptionsRelations<any>;
export const selectParentAndChildCompanyStructure =
  {} as FindOptionsSelect<any>;

export const relationParentAndChildCompanyStructure = {
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
    companyStructureComponent: true
  }
} as FindOptionsRelations<any>;

export const employeePositionRelation = {
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
} as FindOptionsRelations<any>;
