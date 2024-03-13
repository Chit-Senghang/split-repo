import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { DateTimeTransformer } from './date-value-transformer';

export class AuditBaseKoiEntity {
  @Exclude()
  @Column({ nullable: true })
  updatedBy: number;

  @Exclude()
  @Column({ nullable: true })
  createdBy: number;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamp'
  })
  deletedAt: Date;

  @Exclude()
  @VersionColumn()
  version: number;
}
