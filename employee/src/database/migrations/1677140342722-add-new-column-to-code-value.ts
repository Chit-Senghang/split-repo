import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewColumnToCodeValue1677140342722
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "code_value"
        ADD COLUMN "is_enabled" BOOLEAN DEFAULT(TRUE);
        UPDATE "code_value"
        SET "is_enabled" = FALSE
        WHERE "value" != 'English' AND "value" != 'Khmer' AND "code_id" = (SELECT id FROM "code" where "code" = 'LANGUAGE');
        UPDATE "code_value"
        SET "is_system_defined" = true
        WHERE "value" = 'English';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
