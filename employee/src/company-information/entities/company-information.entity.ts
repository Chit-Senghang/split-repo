import { Column, Entity } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity()
export class CompanyInformation extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  nameEn: string;

  @Column({ type: 'varchar', length: 255 })
  nameKh: string;

  @Column({ type: 'varchar', length: 255 })
  addressEn: string;

  @Column({ type: 'varchar', length: 255 })
  addressKh: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  emailAddress: string;
}
