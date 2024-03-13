import { FindOptionsSelect } from 'typeorm/find-options/FindOptionsSelect';
import { Employee } from '../entity/employee.entity';

export const EMPLOYEE_SELECTED_FIELDS = {
  id: true,
  firstNameEn: true,
  lastNameEn: true,
  firstNameKh: true,
  lastNameKh: true,
  displayFullNameEn: true,
  displayFullNameKh: true,
  accountNo: true,
  userId: true,
  startDate: true,
  postProbationDate: true,
  resignDate: true,
  contractType: true,
  contractPeriodStartDate: true,
  contractPeriodEndDate: true,
  employmentType: true,
  dob: true,
  age: true,
  email: true,
  spouseOccupation: true,
  numberOfChildren: true,
  addressHomeNumber: true,
  addressStreetNumber: true,
  taxResponsible: true,
  status: true,
  attendanceAllowanceInProbation: true,
  fingerPrintId: true,
  createdAt: true,
  createdBy: true,
  gender: {
    id: true,
    value: true
  },
  positions: {
    id: true,
    isDefaultPosition: true,
    mpath: true,
    companyStructureCompany: {
      id: true,
      companyStructureComponent: { id: true, name: true, nameKh: true }
    },
    companyStructureLocation: {
      id: true,
      companyStructureComponent: { id: true, name: true, nameKh: true }
    },
    companyStructureOutlet: {
      id: true,
      companyStructureComponent: { id: true, name: true, nameKh: true }
    },
    companyStructureDepartment: {
      id: true,
      companyStructureComponent: { id: true, name: true, nameKh: true }
    },
    companyStructureTeam: {
      id: true,
      companyStructureComponent: { id: true, name: true, nameKh: true }
    },
    companyStructurePosition: {
      id: true,
      companyStructureComponent: { id: true, name: true, nameKh: true },
      positionLevelId: {
        id: true,
        levelNumber: true,
        levelTitle: true
      }
    },
    employee: {
      id: true,
      displayFullNameEn: true,
      displayFullNameKh: true,
      accountNo: true,
      status: true
    }
  },
  workingShiftId: {
    id: true,
    name: true,
    startWorkingTime: true,
    endWorkingTime: true,
    scanType: true,
    startScanTimePartOne: true,
    endScanTimePartOne: true,
    startScanTimePartTwo: true,
    endScanTimePartTwo: true,
    breakTime: true,
    workOnWeekend: true,
    weekendScanTime: true,
    workingHour: true,
    allowLateScanIn: true,
    allowLateScanOut: true,
    workshiftType: {
      id: true,
      name: true,
      workingDayQty: true,
      isSystemDefined: true
    }
  },
  contacts: {
    id: true,
    contact: true,
    isDefault: true,
    countryCode: true
  }
} as FindOptionsSelect<Employee>;
