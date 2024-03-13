import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropColumnInEmployeeMovement1686811578124
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_movement" DROP COLUMN "previous_working_shift_id";
        ALTER TABLE "employee_movement" DROP COLUMN "new_working_shift_id";
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
