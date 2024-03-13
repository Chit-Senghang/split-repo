export const handleTaxReportPagination = (columOrder: string) => {
  const orderByMappings = {
    accountNo: 'payrollReport.employee.accountNo',
    outletId: 'payrollReport.employee.positions.companyStructureOutlet.id',
    surname: 'payrollReport.employee.displayFullNameEn',
    khmerName: 'payrollReport.employee.displayFullNameKh',
    position:
      'payrollReport.employee.positions.companyStructurePosition.companyStructureComponent.id',
    gender: 'payrollReport.employee.gender.id',
    children: 'children',
    houseWife: 'payrollReport.employee.spouseId.id',
    otherBonus: 'payrollReport.benefit',
    hrSalary: 'payrollReport.totalExcludePension',
    deductionForDependent: 'forDependent',
    salaryTaxWithheldUSD: 'payrollReport.salaryTaxWithHeld',
    percentage: 'percent',
    taxablePayableKHR: 'payrollReport.salaryTaxWithHeld',
    taxableSalaryUSD: 'payrollReport.totalMonthlyRound',
    taxableSalaryKHR: 'payrollReport.totalMonthlyRound',
    taxableBasisKHR: 'payrollReport.totalMonthlyRound',
    salaryAfterTaxUSD: 'payrollReport.totalMonthlyRound'
  };

  return orderByMappings[columOrder];
};
