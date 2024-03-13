import { Column, Entity, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { LeaveStockDetailTypeEnum } from '../enums/leave-stock-detail.enum';
import { LeaveStock } from './leave-stock.entity';

@Entity()
export class LeaveStockDetail extends AuditBaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  leaveDay: number;

  @Column()
  type: LeaveStockDetailTypeEnum;

  @Column()
  year: number;

  @Column()
  month: number;

  @ManyToOne(() => LeaveStock, (leaveStock) => leaveStock.id)
  leaveStock: LeaveStock;
}
