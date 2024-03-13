import {
  Entity,
  Column,
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
  Unique,
  JoinColumn
} from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { RolePermission } from '../../role/entities/role-permission.entity';

@Entity()
@Tree('materialized-path')
@Unique('uk_permission_name_parent', ['name', 'parent'])
export class Permission extends AuditBaseEntity {
  @Column()
  @Unique('uk_permission_name', ['name'])
  name: string;

  @TreeChildren()
  children: Permission[];

  @TreeParent()
  @JoinColumn({ foreignKeyConstraintName: 'fk_parent_id_permission_id' })
  parent: Permission;

  @OneToMany(() => RolePermission, (RolePermssion) => RolePermssion.permission)
  rolePermission: RolePermission[];
}
