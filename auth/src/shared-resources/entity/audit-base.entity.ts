import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { DateTimeTransformer } from './date-value-transformer';

export class AuditBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ nullable: true })
  createdBy: number;

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

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  deletedAt: Date;

  @Exclude()
  @VersionColumn()
  version: number;
}
