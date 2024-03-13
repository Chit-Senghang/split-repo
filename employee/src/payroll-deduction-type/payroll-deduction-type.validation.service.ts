import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PayrollDeductionType } from './entities/payroll-deduction-type.entity';

export class PayrollDeductionTypeValidationService {
  constructor(
    @InjectRepository(PayrollDeductionType)
    private readonly payrollDeductionTypeRepo: Repository<PayrollDeductionType>
  ) {}

  async checkPayrollDeductionType(id: number): Promise<PayrollDeductionType> {
    const payrollDeductionType: PayrollDeductionType =
      await this.payrollDeductionTypeRepo.findOneBy({ id });

    if (!payrollDeductionType) {
      throw new ResourceNotFoundException('payroll deduction type', id);
    }

    return payrollDeductionType;
  }

  async validateSystemDefined(
    payrollDeductionType: PayrollDeductionType
  ): Promise<void> {
    if (payrollDeductionType.isSystemDefined) {
      throw new ResourceForbiddenException(
        'isSystemDefined',
        'You cannot modify data because this record is system defined'
      );
    }
  }
}
