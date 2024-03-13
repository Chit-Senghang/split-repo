import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyUniqueConstraintOfEmployeeBankAccount1674448083489
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DELETE FROM "employee_bank_account";
    DROP INDEX "uk_employee_bank_account_is_default_account";
    CREATE UNIQUE INDEX "uk_employee_bank_account_is_default_account_employee_id" ON "employee_bank_account" ("is_default_account","employee_id")
    WHERE
        is_default_account = TRUE AND deleted_at is NULL;
`);
  }

  async down(): Promise<void> {
    return;
  }
}
