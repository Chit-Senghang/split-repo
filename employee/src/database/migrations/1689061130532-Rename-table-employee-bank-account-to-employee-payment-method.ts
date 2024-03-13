import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTableEmployeeBankAccountToEmployeePaymentMethod1689061130532
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_bank_account" RENAME TO "employee_payment_method_account";
        ALTER INDEX "pk_employee_bank_account" RENAME TO "pk_employee_payment_method_account";
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
