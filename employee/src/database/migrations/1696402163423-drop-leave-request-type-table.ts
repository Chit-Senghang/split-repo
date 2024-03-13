import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropLeaveRequestTypeTable1696402163423
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE leave_request_type;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
