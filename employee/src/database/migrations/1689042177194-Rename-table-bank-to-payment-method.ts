import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTableBankToPaymentMethod1689042177194
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP INDEX "uk_bank_name_name";
    ALTER TABLE "bank" RENAME TO "payment_method";
    ALTER INDEX "pk_bank_name_id" RENAME TO "pk_payment_method_id";

    CREATE UNIQUE INDEX "uk_payment_method_name" ON "payment_method" ("name")
    WHERE
    deleted_at is NULL;
    
    ALTER TABLE "employee_bank_account" RENAME COLUMN "bank_id" to "payment_method_id";
    ALTER TABLE "employee_bank_account" DROP CONSTRAINT "fk_bank_id_bank_id";

    ALTER TABLE "employee_bank_account"
    ADD CONSTRAINT "fk_payment_method_payment_method_id"
    FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE NO ACTION ON UPDATE NO action
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
