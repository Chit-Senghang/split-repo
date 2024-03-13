import { Column, Entity, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../../employee/entity/employee.entity';
import { DateTransformer } from '../../../shared-resources/entity/date-value-transformer';

export const dayOffRequestSearchableColumns = ['status'];
@Entity()
export class DayOffRequest extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  employee: Employee;

  @Column({ type: 'timestamp', transformer: new DateTransformer() })
  dayOffDate: Date;

  @Column()
  status: string;
}
