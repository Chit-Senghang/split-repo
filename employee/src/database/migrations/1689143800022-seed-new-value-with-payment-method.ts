import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNewValueWithPaymentMethod1689143800022
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "payment_method" 
            ADD COLUMN "is_system_defined" boolean NOT NULL DEFAULT false;
    `);

    await queryRunner.query(`
        INSERT INTO payment_method ("name", "is_system_defined") VALUES ('CASH', true);
    `);

    await queryRunner.query(`
        ALTER TABLE employee_payment_method_account ALTER COLUMN account_number DROP NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
