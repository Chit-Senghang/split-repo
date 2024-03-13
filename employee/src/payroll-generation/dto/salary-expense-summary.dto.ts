export class SalaryExpenseSummaryDto {
  outletName = '';

  basicSalary = 0;

  companyStructureOutlet: '';

  companyStructureOutletCode: '';

  numberOfStaff = 0;

  additionalBonus = 0;

  totalFixedSalary = 0;

  seniorityPay = 0;

  totalDeduction = 0;

  totalMonthlySalary = 0;

  pensionFundPayByEmployees = 0;

  salaryTaxWithHeldUSD = 0;

  nonTaxSeniority = 0;

  netTotalMonthlySalary = 0;

  totalMonthlySalaryLastMonth = 0;

  totalAmountIncreaseInDollar = 0;

  totalAmountIncreaseInPercentage = 0;

  totalFixedMonthlySalaryLastMonth = 0;

  totalFixedAmountIncreaseInDollar = 0;

  totalBasicAmountIncreaseInPercentage = 0;

  init(dynamicComponents: any): this {
    if (dynamicComponents?.length) {
      dynamicComponents.forEach((element: any) => {
        if (Object.keys(element).at(0) !== 'BASE SALARY') {
          this[Object.keys(element).at(0)] = Object.values(element).at(0);
          this.additionalBonus += Number(Object.values(element).at(0));
        }
      });
    }

    this.calTotalFixedSalary();
    this.calTotalAmountIncreaseByDollar();
    this.calTotalAmountIncreaseInPercentage();
    this.calTotalFixedAmountIncreaseInDollar();
    this.calTotalBasicAmountIncreaseInPercentage();

    return this;
  }

  private calTotalFixedAmountIncreaseInDollar() {
    this.totalFixedAmountIncreaseInDollar =
      Number(this.totalFixedSalary) -
      Number(this.totalFixedMonthlySalaryLastMonth);
  }

  private calTotalFixedSalary() {
    this.totalFixedSalary =
      Number(this.basicSalary) + Number(this.additionalBonus);
  }

  private calTotalAmountIncreaseByDollar() {
    this.totalAmountIncreaseInDollar =
      Number(this.totalMonthlySalary) -
      Number(this.totalMonthlySalaryLastMonth);
  }

  private calTotalAmountIncreaseInPercentage() {
    if (this.totalMonthlySalaryLastMonth === 0) {
      this.totalAmountIncreaseInPercentage = 0;
    } else {
      this.totalAmountIncreaseInPercentage =
        (this.totalAmountIncreaseInDollar / this.totalMonthlySalaryLastMonth) *
        100;
    }
  }

  private calTotalBasicAmountIncreaseInPercentage() {
    if (this.totalFixedMonthlySalaryLastMonth === 0) {
      this.totalBasicAmountIncreaseInPercentage = 0;
    } else {
      this.totalBasicAmountIncreaseInPercentage =
        (this.totalFixedAmountIncreaseInDollar /
          this.totalFixedMonthlySalaryLastMonth) *
        100;
    }
  }
}
