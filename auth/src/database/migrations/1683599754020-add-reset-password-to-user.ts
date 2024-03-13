import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordToUser1683599754020 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
        ADD COLUMN "reset_password" BOOLEAN DEFAULT(false) NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
