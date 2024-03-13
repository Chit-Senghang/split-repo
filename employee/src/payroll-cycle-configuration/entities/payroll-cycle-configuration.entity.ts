import { Column, Entity } from 'typeorm';
import { AuditBaseEntityWithoutDeletedAt } from '../../shared-resources/entity/audit-base-without-deleted-at.entity';
import { PayrollCycleConfigurationMonthEnum } from '../enums/payroll-cycle-configuration.enum';

@Entity()
export class PayrollCycleConfiguration extends AuditBaseEntityWithoutDeletedAt {
  @Column()
  firstCycleFromDate: number;

  @Column()
  firstCycleToDate: number;

  @Column()
  firstCycleFromMonth: PayrollCycleConfigurationMonthEnum;

  @Column()
  firstCycleToMonth: PayrollCycleConfigurationMonthEnum;

  @Column()
  secondCycleFromDate: number;

  @Column()
  secondCycleToDate: number;

  @Column()
  secondCycleFromMonth: PayrollCycleConfigurationMonthEnum;

  @Column()
  secondCycleToMonth: PayrollCycleConfigurationMonthEnum;
}
