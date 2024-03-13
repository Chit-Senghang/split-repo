import { Column, Entity, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { EmployeePaymentMethodAccount } from '../../employee-payment-method-account/entities/employee-payment-method-account.entity';

@Entity({ name: 'payment_method' })
export class PaymentMethod extends AuditBaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column()
  iBankingReportFormat: string;

  @Column({ default: false })
  isSystemDefined: boolean;

  @OneToMany(
    () => EmployeePaymentMethodAccount,
    (employeePaymentMethodAccount) => employeePaymentMethodAccount.paymentMethod
  )
  employeePaymentMethodAccount: EmployeePaymentMethodAccount[];
}
