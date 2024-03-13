import { round } from '../../shared-resources/utils/round-number';

export class TaxReport {
  id: number | string;

  accountNo: string;

  outlet: string;

  surname: string;

  nameKhmer: string;

  gender: string;

  position: string;

  children: number;

  houseWife: number;

  otherBonus: number;

  hrSalary: number;

  taxableSalaryUSD: number;

  taxableSalaryKHR: number;

  // KHR
  deductionForDependent: number;

  taxableBasisKHR: number;

  taxablePayableKHR: number;

  salaryTaxWithheldUSD: number;

  percentage: number;

  salaryAfterTaxUSD: number;

  calculates(exchangeRate?: number) {
    this.taxableSalaryUSD = this.otherBonus + this.hrSalary;
    this.taxableSalaryKHR = round(this.taxableSalaryUSD * exchangeRate);
    this.taxableBasisKHR = this.taxableSalaryKHR - this.deductionForDependent;
    this.taxablePayableKHR = round(this.salaryTaxWithheldUSD * exchangeRate);
    this.salaryAfterTaxUSD = this.taxableSalaryUSD + this.salaryTaxWithheldUSD;
  }
}

export class TaxReportMaster extends TaxReport {
  totalChildren = 0;

  totalHouseWife = 0;

  totalOtherBonus = 0;

  totalHrSalary = 0;

  totalTaxableSalaryUSD = 0;

  totalTaxableSalaryKHR = 0;

  totalDeductionForDependent = 0;

  totalTaxableBasisKHR = 0;

  totalTaxablePayableKHR = 0;

  totalSalaryTaxWithheldUSD = 0;

  totalPercentage = 0;

  totalSalaryAfterTaxUSD = 0;

  data: TaxReport[];

  private sum(data: TaxReport[], property: string) {
    return (
      data?.reduce(
        (total, report) => Number(total) + Number(report[property]),
        0
      ) ?? 0
    );
  }

  calculateTotals() {
    this.totalChildren = this.sum(this.data, `children`);
    this.totalHouseWife = this.sum(this.data, `houseWife`);
    this.totalOtherBonus = this.sum(this.data, `otherBonus`);
    this.totalHrSalary = this.sum(this.data, `hrSalary`);
    this.totalTaxableSalaryUSD = this.sum(this.data, `taxableSalaryUSD`);
    this.totalTaxableSalaryKHR = this.sum(this.data, `taxableSalaryKHR`);
    this.totalDeductionForDependent = this.sum(
      this.data,
      `deductionForDependent`
    );
    this.totalTaxableBasisKHR = this.sum(this.data, `taxableBasisKHR`);
    this.totalTaxablePayableKHR = this.sum(this.data, `taxablePayableKHR`);
    this.totalSalaryTaxWithheldUSD = this.sum(
      this.data,
      `salaryTaxWithheldUSD`
    );
    this.totalPercentage = this.sum(this.data, `percentage`);
    this.totalSalaryAfterTaxUSD = this.sum(this.data, `salaryAfterTaxUSD`);
  }
}
