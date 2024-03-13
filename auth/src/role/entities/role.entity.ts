import { Entity, Column, OneToMany, Unique } from 'typeorm';
import { UserRole } from '../../user/entities/user-role.entity';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { RolePermission } from './role-permission.entity';

@Entity()
export class Role extends AuditBaseEntity {
  @Column({ nullable: false })
  @Unique('uk_role_role_name', ['name'])
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isSystemDefined: boolean;

  @OneToMany(() => UserRole, (UserRole) => UserRole.role)
  userRole: UserRole[];

  @OneToMany(() => RolePermission, (RolePermssion) => RolePermssion.role)
  rolePermission: RolePermission[];
}
