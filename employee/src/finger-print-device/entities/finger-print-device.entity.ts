import { Column, Entity, OneToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { CompanyStructure } from '../../company-structure/entities/company-structure.entity';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';
import { FingerprintDeviceStatusEnum } from '../enums/fingerprint-device-status.enum';

export const fingerPrintDeviceSearchableColumns = ['modelName', 'description'];
@Entity()
export class FingerprintDevice extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column()
  port: number;

  @Column({ type: 'timestamp', transformer: new DateTimeTransformer() })
  lastRetrievedDate: Date;

  @Column()
  lastRetrievedStatus: FingerprintDeviceStatusEnum;

  @Column({ type: 'varchar', length: 50 })
  modelName: string;

  @Column({ type: 'varchar', length: 50 })
  ipAddress: string;

  @Column({ type: 'varchar', length: 50 })
  specification: string;

  @OneToOne(
    () => CompanyStructure,
    (companyStructure) => companyStructure.fingerprintDevice
  )
  companyStructure: CompanyStructure;
}
