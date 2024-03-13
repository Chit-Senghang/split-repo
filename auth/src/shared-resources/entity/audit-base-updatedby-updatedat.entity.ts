import { Exclude } from 'class-transformer';
import {
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DateTimeTransformer } from './date-value-transformer';

export class AuditBaseOnlyUpdatedByAndUpdatedAt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
    foreignKeyConstraintName: 'fk_user_id_updated_by'
  })
  updatedBy: User;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  updatedAt: Date;

  @Exclude()
  @VersionColumn()
  version: number;
}
