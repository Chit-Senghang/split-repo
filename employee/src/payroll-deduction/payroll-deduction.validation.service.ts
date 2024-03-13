import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PayrollDeductionTypeValidationService } from '../payroll-deduction-type/payroll-deduction-type.validation.service';
import { PayrollDeduction } from './entities/payroll-deduction.entity';
import { PAYROLL_DEDUCTION_RELATIONSHIP } from './constant/payroll-deduction-relationship.constant';
import { PAYROLL_DEDUCTION_SELECTED_FIELDS } from './constant/payroll-deduction-selected-fields.constant';

@Injectable()
export class PayrollDeductionValidationService {
  constructor(
    @InjectRepository(PayrollDeduction)
    private readonly payrollDeductionRepo: Repository<PayrollDeduction>,
    private readonly payrollDeductionTypeService: PayrollDeductionTypeValidationService
  ) {}

  async checkPayrollDeductionById(id: number): Promise<PayrollDeduction> {
    const payrollDeduction: PayrollDeduction =
      await this.payrollDeductionRepo.findOne({
        where: {
          id,
          employee: { positions: { isDefaultPosition: true, isMoved: false } }
        },
        relations: PAYROLL_DEDUCTION_RELATIONSHIP,
        select: PAYROLL_DEDUCTION_SELECTED_FIELDS
      });

    if (!payrollDeduction) {
      throw new ResourceNotFoundException('payroll deduction', id);
    }
    return payrollDeduction;
  }

  async checkPayrollDeductionTypeById(id: number): Promise<void> {
    await this.payrollDeductionTypeService.checkPayrollDeductionType(id);
  }
}
