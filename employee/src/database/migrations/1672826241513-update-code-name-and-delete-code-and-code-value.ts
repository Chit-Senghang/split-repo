import { MigrationInterface, QueryRunner } from 'typeorm';
import { isoLanguages } from '../data/languages';

export class updateCodeNameAndDeleteCodeAndCodeValue1672826241513
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //*Update code name in table code.
    await queryRunner.query(`
        UPDATE "code" SET "code" = 'DOCUMENT_TYPE' WHERE code = 'EMPLOYEE_DOCUMENT_TYPE'; 
        UPDATE "code" SET "code" = 'SKILL' WHERE code = 'EMPLOYEE_SKILL'; 
        UPDATE "code" SET "code" = 'RESIGNATION_TYPE' WHERE code = 'EMPLOYEE_RESIGNATION_TYPE'; 
        UPDATE "code" SET "code" = 'WARNING_TYPE' WHERE code = 'EMPLOYEE_WARNING_TYPE'; 
        UPDATE "code" SET "code" = 'TRAINING' WHERE code = 'EMPLOYEE_TRAINING'; 
    `);

    //*Delete code from table code and code_value
    await queryRunner.query(`
        DELETE FROM "code_value" WHERE "code_id" = (SELECT "id" FROM "code" WHERE "code" = 'EMPLOYMENT_TYPE');
        DELETE FROM "code" WHERE "code" = 'EMPLOYMENT_TYPE';
    `);
    await queryRunner.query(`
        DELETE FROM "code_value" WHERE "code_id" = (SELECT "id" FROM "code" WHERE "code" = 'EMPLOYEE_REASON_TEMPLATE');
        DELETE FROM "code" WHERE "code" = 'EMPLOYEE_REASON_TEMPLATE';
    `);
    await queryRunner.query(`
        DELETE FROM "code_value" WHERE "code_id" = (SELECT "id" FROM "code" WHERE "code" = 'MARITAL_STATUS');
        DELETE FROM "code" WHERE "code" = 'MARITAL_STATUS';
    `);

    //*Migrate data language to table code_value
    for (const language of isoLanguages) {
      await queryRunner.query(`
        INSERT INTO "code_value" 
        ("value","code_id")
        VALUES 
        ('${language.name}',(SELECT "id" FROM "code" WHERE code = 'LANGUAGE')) ON CONFLICT DO NOTHING;
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
