import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeBankAccountInit1672381979251
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "bank_name" RENAME TO "bank";
    `);
    await queryRunner.query(`
        CREATE TABLE "employee_bank_account" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "employee_id" integer NOT NULL,
            "bank_id" integer NOT NULL,
            "is_default_account" BOOLEAN NOT NULL DEFAULT(FALSE),
            "account_number" VARCHAR(100) NOT NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_bank_account" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_bank_id_bank_id" FOREIGN KEY ("bank_id") REFERENCES "bank" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_bank_account_employee_id_bank_id" ON "employee_bank_account" ("employee_id","bank_id")
        WHERE
            deleted_at is NULL;
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_bank_account_employee_id_account_number_bank_id" ON "employee_bank_account" ("employee_id","account_number","bank_id")
        WHERE
            deleted_at is NULL;
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_bank_account_is_default_account" ON "employee_bank_account" ("is_default_account")
        WHERE
            is_default_account = TRUE AND deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_bank_account"`);
  }
}
