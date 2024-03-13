import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { Role } from './role.entity';

@Entity()
@Unique('uk_role_permission_permission_role', ['permission', 'role'])
export class RolePermission extends AuditBaseEntity {
  @ManyToOne(() => Permission, (Permission) => Permission.id)
  @JoinColumn({ foreignKeyConstraintName: 'fk_permission_permission_id' })
  permission: Permission;

  @ManyToOne(() => Role, (role) => role.id)
  @JoinColumn({ foreignKeyConstraintName: 'fk_role_role_id' })
  role: Role;
}
