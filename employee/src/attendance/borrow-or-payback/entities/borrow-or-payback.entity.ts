import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BorrowOrPaybackEnum } from '../common/enum/borrow-or-payback.enum';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../../employee/entity/employee.entity';
import { DateTransformer } from '../../../shared-resources/entity/date-value-transformer';

export const borrowPackBackSearchableColumns = [
  'requestDate',
  'startTime',
  'endTime',
  'type',
  'reason',
  'status'
];
@Entity()
export class BorrowOrPaybackRequest extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  requestDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column()
  type: BorrowOrPaybackEnum;

  @Column()
  reason: string;

  @ManyToOne(
    () => BorrowOrPaybackRequest,
    (borrowOrPayback) => borrowOrPayback.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_payback_for_request_id_id_borrow_or_payback_request',
    name: 'payback_for_request_id'
  })
  paybackForRequestId: BorrowOrPaybackRequest;

  @Column()
  status: string;
}
