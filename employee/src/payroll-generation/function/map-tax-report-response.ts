import { TaxReport, TaxReportMaster } from '../dto/tax-report.dto';

export const mapTaxReportResponse = (
  paginationData: any,
  exchangeRate: number
) => {
  const taxReportData = paginationData.data.map((item: any) => {
    const taxReport = new TaxReport();
    taxReport.id = item.id;
    taxReport.accountNo = item.payrollReport.employee.accountNo;
    taxReport.outlet =
      item.payrollReport.employee.positions[0].companyStructureOutlet.companyStructureComponent.name;
    taxReport.surname = item.payrollReport.employee.displayFullNameEn;
    taxReport.nameKhmer = item.payrollReport.employee.displayFullNameKh;
    taxReport.gender = item.payrollReport.employee.gender.value;
    taxReport.position =
      item.payrollReport.employee.positions[0].companyStructurePosition.companyStructureComponent.name;
    taxReport.children = item.children;
    taxReport.houseWife =
      item.payrollReport.employee.spouseId?.value === `Wife` ? 1 : 0;
    taxReport.otherBonus = Number(item.payrollReport.benefit);
    taxReport.hrSalary = Number(item.payrollReport.totalExcludePension);
    taxReport.deductionForDependent = Number(item.forDependent);
    taxReport.salaryTaxWithheldUSD = Number(
      item.payrollReport.salaryTaxWithHeld
    );
    taxReport.percentage = item.percent;
    taxReport.calculates(exchangeRate);

    return taxReport;
  });

  // update data response
  const taxReportMaster = new TaxReportMaster();
  taxReportMaster.data = taxReportData;

  // calculate the sum of all total properties
  taxReportMaster.calculateTotals();
  paginationData.data = taxReportMaster;

  return paginationData;
};
