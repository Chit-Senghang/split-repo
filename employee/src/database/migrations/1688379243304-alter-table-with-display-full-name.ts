import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableWithDisplayFullName1688379243304
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "employee"
    ALTER COLUMN "display_full_name_en" TYPE VARCHAR(255),
    ALTER COLUMN "display_full_name_kh" TYPE VARCHAR(255)
`);
  }

  async down(): Promise<void> {
    return;
  }
}
