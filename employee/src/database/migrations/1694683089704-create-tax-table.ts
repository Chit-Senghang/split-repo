import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaxTable1694683089704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        CREATE TABLE payroll_tax (
            "id" serial primary key,
            "payroll_id" integer,
            "spouse" boolean,
            "for_dependent" decimal,
            "children" integer,
            "basis_amount" decimal,
            "payable_amount" decimal,
            "percent" integer,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint fk_payroll_id foreign key (payroll_id) references payroll_report (id),
            constraint uk_payroll unique (payroll_id)
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
