import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { CompanyStructure } from '../../../company-structure/entities/company-structure.entity';
import { DateTimeTransformer } from '../../../shared-resources/entity/date-value-transformer';

export const attendanceRecordSearchableColumns = ['fingerPrintId'];
@Entity()
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'varchar', length: 255 })
  fingerPrintId: string;

  @Column()
  isMissedScan: boolean;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  scanTime: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer(),
    nullable: true
  })
  beforeAdjustment?: Date;

  @ManyToOne(() => CompanyStructure, (companyStructure) => companyStructure.id)
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_outlet_id_company_structure_outlet_id',
    name: 'company_structure_outlet_id'
  })
  companyStructureOutletId: CompanyStructure;
}
