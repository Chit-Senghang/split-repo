import { Entity, Column } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';
import { RoundTransform } from '../../shared-resources/entity/round-number';

@Entity({ name: 'payroll_master' })
export class PayrollMaster extends AuditBaseEntity {
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new RoundTransform()
  })
  total: number;

  @Column({ type: 'timestamp', transformer: new DateTimeTransformer() })
  date: Date;
}
