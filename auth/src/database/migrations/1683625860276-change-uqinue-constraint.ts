import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUqinueConstraint1683625860276 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      ALTER TABLE "user" DROP CONSTRAINT "uk_user_phone";
      ALTER TABLE "user" DROP CONSTRAINT "uk_user_email";
      `
    );
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_user_phone" ON "user" ("phone")
        WHERE
        deleted_at IS NULL;
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_user_email" ON "user" ("email")
        WHERE
        deleted_at IS NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
