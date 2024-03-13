import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsHqToComapnyStructure1684977955704
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "company_structure"
        ADD COLUMN "is_hq" BOOLEAN DEFAULT(false);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
