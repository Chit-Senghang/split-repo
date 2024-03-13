import { PayrollAdjustmentSummaryDataReportDto } from '../../dto/payroll-adjustment-summary-report.dto';
import { CalculateTypeEnum } from '../enum/calculate-type';
import { BenefitComponent } from '../../../benefit-component/entities/benefit-component.entity';
import { PayrollReport } from '../../../payroll-generation/entities/payroll-report.entity';
import { PayrollBenefitAdjustment } from '../../../payroll-benefit-adjustment/entities/payroll-benefit-adjustment.entity';
import { PayrollBenefitAdjustmentDetail } from './../../../payroll-benefit-adjustment/entities/payroll-benefit-adjustment-detail.entity';
import { transformArrayToObject } from './transform-array-object';

export const getResponsePayrollAdjustmentSummaryDataReport = (
  payrollAdjustmentSummaryReport: PayrollReport[],
  benefitComponent: BenefitComponent[],
  calculateType?: CalculateTypeEnum
): PayrollAdjustmentSummaryDataReportDto[] => {
  return payrollAdjustmentSummaryReport.map((data: PayrollReport) => {
    const summaryDataReport = new PayrollAdjustmentSummaryDataReportDto();

    summaryDataReport.id = data.id;
    summaryDataReport.accountNo = data.employee.accountNo;
    summaryDataReport.name = data.employee.displayFullNameEn;
    summaryDataReport.khmerName = data.employee.displayFullNameKh;
    summaryDataReport.gender = data.employee.gender.value;
    summaryDataReport.position =
      data.employee.positions[0].companyStructurePosition.companyStructureComponent.name;
    summaryDataReport.outlet =
      data.employee.positions[0].companyStructureOutlet.companyStructureComponent.name;
    summaryDataReport.department =
      data.employee.positions[0].companyStructureDepartment.companyStructureComponent.name;
    summaryDataReport.startWorkDate = data.employee.startDate;
    summaryDataReport.daysWorked =
      data.employee.workingShiftId.workshiftType.workingDayQty;
    summaryDataReport.totalFixedSalary = data.totalMonthly;

    // convert array of benefitComponent to object with default values 0
    const benefitComponentList = transformArrayToObject(benefitComponent);

    // convert payroll benefit adjustment array to object with names as keys and amounts as values
    const benefitComponentAdjustment =
      data.employee.payrollBenefitAdjustment.flatMap(
        (payrollBenefitAdjustment: PayrollBenefitAdjustment) => {
          return payrollBenefitAdjustment.payrollBenefitAdjustmentDetail.map(
            (
              payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail
            ) => ({
              name: payrollBenefitAdjustmentDetail.benefitComponent.name,
              amount: payrollBenefitAdjustmentDetail.adjustAmount
            })
          );
        }
      );

    const benefitComponentUpdate = transformArrayToObject(
      benefitComponentAdjustment
    );

    // combine both objects into payrollBenefit
    summaryDataReport.payrollBenefit = {
      ...benefitComponentList,
      ...benefitComponentUpdate
    };

    // check condition by calculate type
    if (calculateType === CalculateTypeEnum.TOTAL) {
      summaryDataReport.calculateTotal();
    } else if (calculateType === CalculateTypeEnum.INCREMENT_AMOUNT) {
      summaryDataReport.calculateIncrementAmount();
    } else {
      summaryDataReport.total = summaryDataReport.totalFixedSalary;
    }

    return summaryDataReport;
  });
};
