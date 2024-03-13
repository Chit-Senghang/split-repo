import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTimestamptzToTimestamp1688101884226
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        -- audit_log
        ALTER TABLE audit_log
        ALTER COLUMN deleted_at TYPE TIMESTAMP;
        
        -- otp
        ALTER TABLE otp
        ALTER COLUMN expire_at TYPE TIMESTAMP,
        ALTER COLUMN created_at TYPE TIMESTAMP;
        
        -- permission
        ALTER TABLE permission
        ALTER COLUMN created_at TYPE TIMESTAMP,
        ALTER COLUMN updated_at TYPE TIMESTAMP,
        ALTER COLUMN deleted_at TYPE TIMESTAMP;
        
        -- role
        ALTER TABLE role
        ALTER COLUMN created_at TYPE TIMESTAMP,
        ALTER COLUMN updated_at TYPE TIMESTAMP,
        ALTER COLUMN deleted_at TYPE TIMESTAMP;
        
        -- role_permission
        ALTER TABLE role_permission
        ALTER COLUMN created_at TYPE TIMESTAMP,
        ALTER COLUMN updated_at TYPE TIMESTAMP,
        ALTER COLUMN deleted_at TYPE TIMESTAMP;
        
        -- user
        ALTER TABLE "user"
        ALTER COLUMN created_at TYPE TIMESTAMP,
        ALTER COLUMN updated_at TYPE TIMESTAMP,
        ALTER COLUMN deleted_at TYPE TIMESTAMP;
        
        -- user_consumer
        ALTER TABLE user_consumer
        ALTER COLUMN created_at TYPE TIMESTAMP,
        ALTER COLUMN updated_at TYPE TIMESTAMP,
        ALTER COLUMN deleted_at TYPE TIMESTAMP;
        
        -- user_role
        ALTER TABLE user_role
        ALTER COLUMN created_at TYPE TIMESTAMP,
        ALTER COLUMN updated_at TYPE TIMESTAMP,
        ALTER COLUMN deleted_at TYPE TIMESTAMP;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
