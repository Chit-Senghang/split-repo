import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { CodeValue } from './code-value.entity';

@Entity()
export class Code {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Unique('uk_code_code', ['code'])
  code: string;

  @Column()
  value: string;

  @Column({ default: false })
  isSystemDefined: boolean;

  @OneToMany(() => CodeValue, (CodeValue) => CodeValue.codeId)
  codeValue: CodeValue[];
}
