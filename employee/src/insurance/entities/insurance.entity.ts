import { Column, Entity, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { EmployeeInsurance } from '../../employee-insurance/entities/employee-insurance.entity';

export const insuranceSearchableColumns = ['name'];
@Entity()
export class Insurance extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(
    () => EmployeeInsurance,
    (employeeInsurance) => employeeInsurance.insuranceId
  )
  employeeInsurance: EmployeeInsurance[];
}
