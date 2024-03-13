export interface EmployeeInterface {
  employeePositionId?: number;
  oldEmployeePositionId: number;
  employeeMovementId?: number;
  newEmployeePositionId?: number;
  employeeId: number;
  lastMovementDate: string;
  newWorkingShiftId: number;
  companyId: number;
  locationId: number;
  positionId: number;
}

export interface PayRollGenerationInterface {
  outlet: string;
  qtyOfEmp: number;
  totalMonthlySalaryPerOutlet: number;
}
