import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnsToPayrollBenefitAndInitPayfollBenefitMaster1689237779789
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "payroll_benefit_master" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "code" VARCHAR(255) NOT NULL,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "pk_payroll_benefit_master_id" PRIMARY KEY ("id")
        )
    `);
    await queryRunner.query(`
      DELETE FROM "payroll_benefit";
      ALTER TABLE "payroll_benefit"
      ADD COLUMN "type" VARCHAR(20) NOT NULL,
      ADD COLUMN "payroll_benefit_master_id" INTEGER NOT NULL,
      ADD CONSTRAINT "fk_payroll_benefit_payroll_benefit_master_id" FOREIGN KEY ("payroll_benefit_master_id") REFERENCES "payroll_benefit_master" (id) ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payroll_benefit_master"`);
  }
}
