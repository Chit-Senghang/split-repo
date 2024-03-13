import { ManyToOne, Entity, Unique, JoinColumn } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Role } from '../../role/entities/role.entity';
import { User } from './user.entity';

@Entity()
@Unique('user_role_constrain', ['user', 'role'])
export class UserRole extends AuditBaseEntity {
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_user_id_user_id',
    name: 'user_id'
  })
  user: User;

  @ManyToOne(() => Role, (role) => role.id, { eager: true })
  @JoinColumn({ foreignKeyConstraintName: 'fk_role_id_role_id' })
  role: Role;
}
