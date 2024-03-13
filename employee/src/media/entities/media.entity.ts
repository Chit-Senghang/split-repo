import { Column, Entity } from 'typeorm';
import { MediaEntityTypeEnum } from '../common/ts/enums/entity-type.enum';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity()
export class Media extends AuditBaseEntity {
  @Column()
  entityType: MediaEntityTypeEnum;

  @Column()
  entityId: number;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  name: string;

  @Column()
  filename: string;

  @Column()
  description: string;
}
