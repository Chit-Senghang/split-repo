import { Column, Entity } from 'typeorm';
import { AuditBaseOnlyUpdatedByAndUpdatedAt } from '../../shared-resources/entity/audit-base-updatedby-updatedat.entity';

export const globalConfigurationSearchableColumns = [
  'name',
  'description',
  'value'
];
@Entity()
export class GlobalConfiguration extends AuditBaseOnlyUpdatedByAndUpdatedAt {
  @Column({ length: 255 })
  name: string;

  @Column()
  isEnable: boolean;

  @Column({ length: 255 })
  value: string;

  @Column()
  isSystemDefined: boolean;

  @Column({ length: 255 })
  description: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 255 })
  regex: string;

  @Column({ length: 255 })
  message: string;

  @Column({ length: 255 })
  dataType: string;
}
