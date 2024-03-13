import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { GeographicTypeEnum } from '../../database/data/geographic-type.enum';

export const geographicSearchableColumns = ['nameEn', 'nameKh'];
@Entity()
export class Geographic extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 10 })
  locationCode: string;

  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @Column({ type: 'varchar', length: 100 })
  nameKh: string;

  @Column()
  geographicType: GeographicTypeEnum;

  @ManyToOne(() => Geographic, (geographic) => geographic.parentId)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_parent_id_geographic_id',
    name: 'parent_id'
  })
  parentId: Geographic;

  @OneToMany(() => Geographic, (geographic) => geographic.parentId)
  children: Geographic[];
}
