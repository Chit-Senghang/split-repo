import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { PaymentMethod } from '../../payment-method/entities/payment-method.entity';

@Entity({ name: 'employee_payment_method_account' })
export class EmployeePaymentMethodAccount extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.paymentMethodAccounts)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @ManyToOne(
    () => PaymentMethod,
    (paymentMethod) => paymentMethod.employeePaymentMethodAccount
  )
  @JoinColumn({
    foreignKeyConstraintName: 'fk_payment_method_payment_method_id',
    name: 'payment_method_id'
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 100 })
  accountNumber: string;

  @Column({ type: 'boolean', default: 0 })
  isDefaultAccount: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  trimColumns() {
    Object.values(this).toString().trim();
  }
}
