import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnOvertimeTypeToOvertimeRequest1697616996875
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        -- create a custom ENUM type
        CREATE TYPE overtime_type_enum AS ENUM ('HOUR', 'WORKING_SHIFT');

        -- add new column overtime_type with type enum
        ALTER TABLE overtime_request
        ADD COLUMN overtime_type overtime_type_enum;

    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
