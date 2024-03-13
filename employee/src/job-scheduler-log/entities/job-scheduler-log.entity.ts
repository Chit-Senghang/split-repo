import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';

@Entity()
export class JobSchedulerLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255
  })
  name: string;

  @Column({
    type: 'time without time zone',
    transformer: new DateTimeTransformer()
  })
  lastStartTime: string;

  @Column({
    type: 'time without time zone',
    transformer: new DateTimeTransformer()
  })
  lastEndTime: string;

  @Column({ type: 'varchar', length: 255 })
  lastStatus: string;

  @Column({ type: 'varchar', length: 255 })
  runningType: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
