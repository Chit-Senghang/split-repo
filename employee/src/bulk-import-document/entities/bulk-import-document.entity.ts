import { Column, Entity } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { BulkTypeEnum } from '../enum/type.enum';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';

@Entity()
export class BulkImportDocument extends AuditBaseEntity {
  @Column()
  type: BulkTypeEnum;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  importEndTime: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  importStartTime: Date;

  @Column()
  isCompleted: boolean;

  @Column()
  totalRecord: number;

  @Column()
  successCount: number;

  @Column()
  failureCount: number;
}
