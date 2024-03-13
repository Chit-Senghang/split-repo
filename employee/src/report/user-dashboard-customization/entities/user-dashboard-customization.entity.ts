import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

@Entity()
export class UserDashboardCustomization {
  @PrimaryGeneratedColumn()
  id: number;

  @VersionColumn({ select: false })
  version: number;

  @Column({ select: false })
  userId: number;

  @Column()
  reportId: number;

  @Column({ type: 'decimal', precision: 2 })
  sizeWeight: number;

  @Column({ type: 'decimal', precision: 2 })
  sizeHeight: number;

  @Column({ type: 'decimal', precision: 2 })
  layoutWeight: number;

  @Column({ type: 'decimal', precision: 2 })
  layoutHeight: number;

  @Column({ type: 'decimal', precision: 2 })
  layoutX: number;

  @Column({ type: 'decimal', precision: 2 })
  layoutY: number;
}
