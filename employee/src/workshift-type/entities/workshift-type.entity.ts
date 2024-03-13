import { Column, Entity, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { WorkingShift } from './working-shift.entity';

@Entity()
export class WorkshiftType extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column()
  workingDayQty: number;

  @Column({ type: 'boolean', default: 0 })
  isSystemDefined: boolean;

  @OneToMany(() => WorkingShift, (workingShift) => workingShift.workshiftType)
  workingShift: WorkingShift[];
}
