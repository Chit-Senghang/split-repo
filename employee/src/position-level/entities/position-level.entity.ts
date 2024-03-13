import { Column, Entity, OneToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { CompanyStructure } from '../../company-structure/entities/company-structure.entity';

export const positionLevelSearchableColumns = ['levelTitle'];
@Entity()
export class PositionLevel extends AuditBaseEntity {
  @Column()
  levelTitle: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  levelNumber: number;

  @OneToOne(
    () => CompanyStructure,
    (companyStructure) => companyStructure.positionLevelId,
    {
      cascade: true
    }
  )
  companyStructure: CompanyStructure;
}
