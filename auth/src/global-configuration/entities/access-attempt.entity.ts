import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AccessAttemptEnum } from '../common/ts/enums/access-attempt-type.enum';
import { User } from '../../user/entities/user.entity';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity()
export class AccessAttempt extends AuditBaseEntity {
  @Column()
  isSuccess: boolean;

  @Column()
  ipAddress: string;

  @Column()
  deviceDetail: string;

  @Column()
  type: AccessAttemptEnum;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ foreignKeyConstraintName: 'fk_user_id_user', name: 'user_id' })
  user: User;
}
