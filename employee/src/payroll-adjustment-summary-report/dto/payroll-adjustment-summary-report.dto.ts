import { Injectable } from '@nestjs/common';

type PayrollBenefit = Record<string, number>;

export class PayrollAdjustmentSummaryDataReportDto {
  id: string | number;

  accountNo: string;

  name: string;

  khmerName: string;

  gender: string;

  position: string;

  outlet: string;

  department: string;

  startWorkDate: Date | string;

  daysWorked: number;

  totalFixedSalary: number;

  payrollBenefit: PayrollBenefit;

  total: number;

  incrementAmount: number;

  calculateTotal() {
    this.total = this.sumBenefit();
  }

  calculateIncrementAmount() {
    this.incrementAmount = this.sumBenefit() - this.totalFixedSalary;
  }

  private sumBenefit() {
    // sum all benefit
    return Object.values(this.payrollBenefit).reduce(
      (total, value) => Number(total) + Number(value),
      0
    );
  }
}

@Injectable()
export class PayrollAdjustmentSummaryMasterReportDto {
  subTotal: number;

  data: PayrollAdjustmentSummaryDataReportDto[] = [];

  calculateSubTotal() {
    this.subTotal = this.data.reduce(
      (value, item) =>
        Number(value) + Number(item.total ?? item.incrementAmount),
      0
    );
  }
}
