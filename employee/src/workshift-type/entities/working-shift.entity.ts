import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { EmployeeMovement } from '../../employee-movement/entities/employee-movement.entity';
import { WorkshiftType } from './workshift-type.entity';

export const searchableColumnsWorkingShift = ['name'];

@Entity()
export class WorkingShift extends AuditBaseEntity {
  @ManyToOne(() => WorkshiftType, (workshiftType) => workshiftType.workingShift)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_workshift_type_id_workshift_type',
    name: 'workshift_type_id'
  })
  workshiftType: WorkshiftType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'time' })
  startWorkingTime: Date;

  @Column({ type: 'time' })
  endWorkingTime: Date;

  @Column()
  scanType: number;

  @Column({ type: 'time' })
  startScanTimePartOne: Date;

  @Column({ type: 'time' })
  endScanTimePartOne: Date;

  @Column({ type: 'time' })
  startScanTimePartTwo: Date;

  @Column({ type: 'time' })
  endScanTimePartTwo: Date;

  @OneToMany(
    () => EmployeeMovement,
    (employeeMovement) => employeeMovement.previousCompanyStructurePosition
  )
  employeeMovements: EmployeeMovement[];

  @Column()
  breakTime: number;

  @Column()
  workOnWeekend: boolean;

  @Column({ type: 'time' })
  weekendScanTime: Date;

  @Column()
  workingHour: number;

  @Column()
  allowLateScanIn: number;

  @Column()
  allowLateScanOut: number;
}
