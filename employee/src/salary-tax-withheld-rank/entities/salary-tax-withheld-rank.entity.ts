import { Column, Entity } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { SalaryTaxTypeEnum } from '../enums/salary-tax-type.enum';

@Entity('tax_rate')
export class SalaryTaxWithheldRank extends AuditBaseEntity {
  @Column()
  type: SalaryTaxTypeEnum;

  @Column({ type: 'decimal', scale: 10 })
  fromAmount: number;

  @Column({ type: 'decimal', scale: 10 })
  toAmount: number;

  @Column({ type: 'decimal', scale: 10 })
  taxRate: number;

  @Column({ type: 'decimal', scale: 10 })
  deduction: number;
}
