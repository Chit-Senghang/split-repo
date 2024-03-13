import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateKeyValueToCodeValue1671501344076
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM "employee";
        DELETE FROM "pay_grade";
        DELETE FROM "key_value";
        DELETE FROM "key";
        ALTER TABLE "key" RENAME TO "code";
        ALTER TABLE "code" ADD "value" character varying NULL;
        ALTER TABLE "code" ADD "is_system_defined"  boolean NOT NULL DEFAULT false;
        ALTER TABLE "code" ADD "deleted_at" TIMESTAMP;
        ALTER TABLE "key_value" RENAME COLUMN "key_id" TO "code_id";
        ALTER TABLE "key_value" RENAME COLUMN "enable" TO "is_system_defined";
        ALTER TABLE "key_value" ADD "parent_id" integer;
        ALTER TABLE "key_value" ADD "deleted_at" TIMESTAMP;
        ALTER TABLE "key_value" ADD CONSTRAINT "fk_parent_id_code_value_id" FOREIGN KEY ("parent_id") REFERENCES "key_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "key_value" RENAME TO "code_value";
        `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_code_code" ON "code" ("code")
        WHERE
          deleted_at is NULL;
        CREATE UNIQUE INDEX "uk_code_value_code" ON "code_value" ("value","code_id")
        WHERE
          deleted_at is NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
