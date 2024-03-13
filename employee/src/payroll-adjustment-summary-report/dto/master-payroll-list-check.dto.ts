export class MasterPayrollListCheckDto {
  totalFixedSalary = 0;

  resignedEmployees = 0;

  newEmployeesAdded = 0;

  postProbationEmployees = 0;

  fullPostProbationEmployees = 0;

  salaryIncrementEmployees = 0;

  employeesWhoChangeWorkShift = 0;

  others = 0;

  get check(): number {
    return this._calculateCheck();
  }

  private _calculateCheck = () => {
    return (
      this.totalFixedSalary +
      this.resignedEmployees +
      this.newEmployeesAdded +
      this.postProbationEmployees +
      this.fullPostProbationEmployees +
      this.salaryIncrementEmployees +
      this.employeesWhoChangeWorkShift +
      this.others
    );
  };
}
