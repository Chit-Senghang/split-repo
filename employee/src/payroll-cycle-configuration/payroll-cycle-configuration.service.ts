import { Inject, Injectable } from '@nestjs/common';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { UpdatePayrollCycleConfigurationDto } from './dto/update-payroll-cycle-configuration.dto';
import { IPayrollCycleConfiguration } from './repository/interfaces/payroll-cycle-configuration.repository.interface';
import { PayrollCycleConfigurationRepository } from './repository/payroll-cycle-configuration.repository';
import { PayrollCycleConfiguration } from './entities/payroll-cycle-configuration.entity';
import { PayrollCycleConfigurationMonthEnum } from './enums/payroll-cycle-configuration.enum';

@Injectable()
export class PayrollCycleConfigurationService {
  constructor(
    @Inject(PayrollCycleConfigurationRepository)
    private readonly payrollCycleConfigurationRepo: IPayrollCycleConfiguration
  ) {}

  async findOne(): Promise<PayrollCycleConfiguration> {
    return await this.payrollCycleConfigurationRepo.getOneWithNotFound();
  }

  async update(
    updatePayrollCycleConfigurationDto: UpdatePayrollCycleConfigurationDto
  ) {
    const payrollCycleConfiguration =
      await this.payrollCycleConfigurationRepo.getOneWithNotFound();

    // validate update payroll cycle configuration date
    this.validateUpdatePayrollCycleConfigurationDate(
      updatePayrollCycleConfigurationDto
    );

    // validate payroll configuration month

    this.validateUpdatePayrollCycleConfigurationMonth(
      updatePayrollCycleConfigurationDto
    );

    const payrollCycleConfigurationEntity: PayrollCycleConfiguration =
      this.payrollCycleConfigurationRepo.create({
        id: payrollCycleConfiguration.id,
        ...updatePayrollCycleConfigurationDto
      });

    return await this.payrollCycleConfigurationRepo.save(
      payrollCycleConfigurationEntity
    );
  }

  // =================== [Private Block] ===================

  private validateUpdatePayrollCycleConfigurationMonth({
    firstCycleFromMonth,
    firstCycleToMonth,
    secondCycleFromMonth,
    secondCycleToMonth
  }: UpdatePayrollCycleConfigurationDto) {
    if (secondCycleFromMonth === PayrollCycleConfigurationMonthEnum.PREVIOUS) {
      throw new ResourceBadRequestException(
        'secondCycleFromMonth',
        'The second cycle from month must not be previous.'
      );
    }

    if (secondCycleToMonth === PayrollCycleConfigurationMonthEnum.PREVIOUS) {
      throw new ResourceBadRequestException(
        'secondCycleToMonth',
        'The second cycle to month must not be previous.'
      );
    }

    if (
      secondCycleFromMonth &&
      firstCycleFromMonth === PayrollCycleConfigurationMonthEnum.PREVIOUS
    ) {
      throw new ResourceBadRequestException(
        'firstCycleFromMonth',
        'The first cycle from month must not be previous.'
      );
    }

    if (
      secondCycleToMonth &&
      firstCycleToMonth === PayrollCycleConfigurationMonthEnum.PREVIOUS
    ) {
      throw new ResourceBadRequestException(
        'firstCycleToMonth',
        'The first cycle to month must not be previous.'
      );
    }

    if (
      !secondCycleFromMonth &&
      firstCycleToMonth === PayrollCycleConfigurationMonthEnum.PREVIOUS
    ) {
      throw new ResourceBadRequestException(
        'firstCycleToMonth',
        'The first cycle to month must not be previous.'
      );
    }
  }

  private validateUpdatePayrollCycleConfigurationDate({
    firstCycleFromDate,
    firstCycleToDate,
    firstCycleFromMonth,
    firstCycleToMonth,
    secondCycleFromDate,
    secondCycleToDate,
    secondCycleFromMonth,
    secondCycleToMonth
  }: UpdatePayrollCycleConfigurationDto) {
    //check first from date and second to date
    this.checkFirstDateGreaterThanOrEqualToSecondOne(
      firstCycleFromDate,
      firstCycleToDate,
      firstCycleFromMonth,
      firstCycleToMonth,
      'The first cycle from date must not be greater than or equal to first cycle to date.'
    );

    //validate not given second month option
    this.validateSecondMonthOption(
      secondCycleFromMonth,
      secondCycleToMonth,
      secondCycleFromDate,
      secondCycleToDate
    );

    //check between first from date and first to date
    this.validateDateRange(
      firstCycleFromDate,
      firstCycleToDate,
      secondCycleFromDate,
      'The second cycle from date must be greater than first cycle to date one day.'
    );

    //check second from date and second to date
    this.checkFirstDateGreaterThanOrEqualToSecondOne(
      secondCycleFromDate,
      secondCycleToDate,
      secondCycleFromMonth,
      secondCycleToMonth,
      'The second cycle from date must not be greater than or equal to second cycle to date.'
    );
  }

  private validateDateRange = (
    fromDate: number,
    toDate: number,
    secondDate: number,
    message: string
  ) => {
    if (
      (!!secondDate && secondDate >= fromDate && secondDate <= toDate) ||
      (!!secondDate && Math.abs(secondDate - toDate) > 1)
    ) {
      throw new ResourceBadRequestException(message.split(' ').at(0), message);
    }
  };

  private checkFirstDateGreaterThanOrEqualToSecondOne(
    fromDate: number,
    toDate: number,
    fromMonth: PayrollCycleConfigurationMonthEnum,
    toMonth: PayrollCycleConfigurationMonthEnum,
    message: string
  ) {
    if (!!fromDate && fromDate >= toDate && fromMonth === toMonth) {
      throw new ResourceBadRequestException(message.split(' ').at(0), message);
    }
  }

  private validateSecondMonthOption(
    secondCycleFromMonth: PayrollCycleConfigurationMonthEnum,
    secondCycleToMonth: PayrollCycleConfigurationMonthEnum,
    secondCycleFromDate: number,
    secondCycleToDate: number
  ) {
    if (secondCycleFromDate && !secondCycleFromMonth) {
      throw new ResourceBadRequestException(
        'secondCycleFromMonth',
        'The second cycle from month must not be empty.'
      );
    }

    if (secondCycleToDate && !secondCycleToMonth) {
      throw new ResourceBadRequestException(
        'secondCycleToMonth',
        'The second cycle to month must not be empty.'
      );
    }

    if (secondCycleToMonth && !secondCycleToDate) {
      throw new ResourceBadRequestException(
        'secondCycleToDate',
        'The second cycle to date must not be empty.'
      );
    }

    if (secondCycleFromMonth && !secondCycleFromDate) {
      throw new ResourceBadRequestException(
        'secondCycleFromDate',
        'The second cycle from date must not be empty.'
      );
    }
  }
}
