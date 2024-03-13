import {
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DateTimeTransformer } from './date-value-transformer';

export class AuditBaseOnlyCreatedByAndCreatedAt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'created_by',
    foreignKeyConstraintName: 'fk_user_id_created_by'
  })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'updated_by',
    foreignKeyConstraintName: 'fk_user_id_updated_by'
  })
  updatedBy: User;

  @CreateDateColumn({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp'
  })
  deletedAt: Date;

  @VersionColumn()
  version: number;
}
