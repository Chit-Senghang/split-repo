export const sort = {
  employeeId: { path: 'employee.id', type: 'number' },
  displayFullNameEn: { path: 'employee.displayFullNameEn', type: 'string' },
  location: {
    path: 'employee.positions.0.companyStructureLocation.id',
    type: 'number'
  },
  outlet: {
    path: 'employee.positions.0.companyStructureOutlet.id',
    type: 'number'
  },
  department: {
    path: 'employee.positions.0.companyStructureDepartment.id',
    type: 'number'
  },
  team: {
    path: 'employee.positions.0.companyStructureTeam.id',
    type: 'number'
  },
  position: {
    path: 'employee.positions.0.companyStructurePosition.id',
    type: 'number'
  },
  dayOff: {
    path: 'dayOff',
    type: 'boolean'
  },
  absent: {
    path: 'isAbsent',
    type: 'boolean'
  },
  leave: {
    path: 'leave',
    type: 'boolean'
  },
  startScanPartOne: {
    path: 'startScanPartOne',
    type: 'string'
  },
  lateScanPartOne: {
    path: 'lateScanPartOne',
    type: 'string'
  },
  endScanPartOne: {
    path: 'endScanPartOne',
    type: 'string'
  },
  lateScanPartTwo: {
    path: 'lateScanPartTwo',
    type: 'string'
  },
  startScanPartTwo: {
    path: 'startScanPartTwo',
    type: 'string'
  },
  lateScanPartThree: {
    path: 'lateScanPartThree',
    type: 'string'
  },
  endScanPartTwo: {
    path: 'endScanPartTwo',
    type: 'string'
  },
  lateScanPartFour: {
    path: 'lateScanPartFour',
    type: 'string'
  },
  scanType: {
    path: 'scanType',
    type: 'number'
  },
  ot: {
    path: 'overTime',
    type: 'boolean'
  },
  otDuration: {
    path: 'overTimeDuration',
    type: 'number'
  },
  workingHour: {
    path: 'workingHour',
    type: 'number'
  }
};
