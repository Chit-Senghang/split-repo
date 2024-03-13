import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { DateTimeTransformer } from './date-value-transformer';

export class AuditBaseEntityWithoutDeletedAt {
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
  @VersionColumn()
  version: number;
}
