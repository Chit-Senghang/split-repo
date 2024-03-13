import { Column, Entity } from 'typeorm';
import { ReasonTemplateTypeEnum } from '../common/ts/enum/type.enum';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity()
export class ReasonTemplate extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  type: ReasonTemplateTypeEnum;

  @Column()
  name: string;

  @Column()
  isSystemDefined: boolean;
}
