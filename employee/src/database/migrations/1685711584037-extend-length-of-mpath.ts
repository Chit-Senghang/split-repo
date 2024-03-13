import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendLengthOfMpath1685711584037 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_position"
        ALTER COLUMN "mpath" TYPE VARCHAR(255);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
