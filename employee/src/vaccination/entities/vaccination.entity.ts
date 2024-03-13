import { Column, Entity } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity()
export class Vaccination extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
