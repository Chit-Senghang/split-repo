export class MasterPayrollListDto {
  previousTotalFixedSalary: number;

  currentTotalFixedSalary: number;

  totalBasicAmountIncreaseInDollar: number;

  totalBasicAmountIncreaseInPercentage: number;

  set _currentTotalFixedSalary(value: number) {
    this.currentTotalFixedSalary = value;
    this.calculateTotalBasicAmountIncreaseInDollar();
    this.calculateTotalBasicAmountIncreaseInPercentage();
  }

  private calculateTotalBasicAmountIncreaseInDollar() {
    this.totalBasicAmountIncreaseInDollar =
      this.currentTotalFixedSalary - this.previousTotalFixedSalary;
  }

  private calculateTotalBasicAmountIncreaseInPercentage() {
    this.totalBasicAmountIncreaseInPercentage =
      this.totalBasicAmountIncreaseInDollar / this.currentTotalFixedSalary;
  }
}
