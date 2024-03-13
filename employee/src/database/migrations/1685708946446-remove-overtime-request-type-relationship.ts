import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOvertimeRequestTypeRelationship1685708946446
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "overtime_request"
        DROP CONSTRAINT "fk_overtime_type_id_overtime_request_id";
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
