import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOvertimeRequestTypeColumn1685709278714
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "overtime_request"
        DROP COLUMN "overtime_type_id";
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
