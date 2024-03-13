import { Exclude } from 'class-transformer';
import { Entity, Column, OneToMany, OneToOne, Unique } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { AuditLog } from '../../audit-logging/entities/audit-logging.entity';
import { UserConsumer } from './user-consumer.entity';
import { UserRole } from './user-role.entity';

export const userSearchableColumns = ['username', 'phone', 'email'];
@Entity()
export class User extends AuditBaseEntity {
  @Column()
  isActive: boolean;

  @Column()
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  @Unique('uk_user_phone', ['phone'])
  phone: string;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  resetPassword: boolean;

  @Column({ nullable: true })
  @Unique('uk_user_email', ['email'])
  email: string;

  @Column({ default: true, name: 'is_self_service' })
  isSelfService: boolean;

  @OneToMany(() => UserRole, (UserRole) => UserRole.user)
  userRole: UserRole[];

  @OneToMany(() => AuditLog, (AuditLogging) => AuditLogging.createdBy)
  auditLogging: AuditLog[];

  @OneToOne(() => UserConsumer, (UserConsumer) => UserConsumer.user)
  userConsumer: UserConsumer;
}
