import { Entity, Column, OneToOne, JoinColumn, Unique } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { User } from './user.entity';

@Entity()
export class UserConsumer extends AuditBaseEntity {
  @Column()
  @Unique('uk_user_consumer_consumer_id', ['consumerId'])
  consumerId: string;

  @OneToOne(() => User, (User) => User.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_user_id_user_id',
    name: 'user_id'
  })
  user: User;
}
