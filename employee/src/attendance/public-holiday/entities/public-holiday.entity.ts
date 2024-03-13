import { Column, Entity } from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { DateTransformer } from '../../../shared-resources/entity/date-value-transformer';

export const PublicHolidaySearchableColumns = ['name'];
@Entity()
export class PublicHoliday extends AuditBaseEntity {
  @Column({
    type: 'date',
    transformer: new DateTransformer()
  })
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  bonusPercentage: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
