import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSalaryTaxWithheldRank1705390083175
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE tax_rate (
            id SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMPTZ NULL,
            type VARCHAR NOT NULL,
            from_amount DECIMAL NOT NULL DEFAULT(0),
            to_amount DECIMAL NULL,
            tax_rate DECIMAL NOT NULL DEFAULT(0),
            deduction DECIMAL NOT NULL DEFAULT(0),
            CONSTRAINT pk_salary_tax_withheld_rank PRIMARY KEY ("id")
        );
    `);

    await queryRunner.query(`
        INSERT INTO tax_rate (from_amount, to_amount, tax_rate, deduction,type)
        VALUES (0,1500000,0,0,'TAX_WITHHELD_RANK'),
        (1500001,2000000,5,75000,'TAX_WITHHELD_RANK'),
        (2000001,8500000,10,175000,'TAX_WITHHELD_RANK'),
        (8500001,12500000,15,600000,'TAX_WITHHELD_RANK'),
        (12500001,null,20,1225000,'TAX_WITHHELD_RANK');
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
