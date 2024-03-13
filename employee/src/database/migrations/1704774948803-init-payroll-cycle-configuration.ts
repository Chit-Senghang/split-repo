import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPayrollCycleConfiguration1704774948803
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE payroll_cycle_configuration_enum AS ENUM('CURRENT','PREVIOUS');
    `);
    await queryRunner.query(`
        CREATE TABLE "payroll_cycle_configuration" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "first_cycle_from_date" INTEGER NOT NULL,
            "first_cycle_to_date" INTEGER NOT NULL,
            "first_cycle_from_month" payroll_cycle_configuration_enum NOT NULL,
            "first_cycle_to_month" payroll_cycle_configuration_enum NOT NULL,
            "second_cycle_from_date" INTEGER,
            "second_cycle_to_date" INTEGER,
            "second_cycle_from_month" payroll_cycle_configuration_enum,
            "second_cycle_to_month" payroll_cycle_configuration_enum,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT pk_payroll_cycle_configuration PRIMARY KEY ("id")
        );
    `);
    await queryRunner.query(`
        INSERT INTO payroll_cycle_configuration (first_cycle_from_date, first_cycle_to_date, first_cycle_from_month, first_cycle_to_month)
        VALUES (01,31,'CURRENT','CURRENT');
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE payroll_cycle_configuration;
    `);
  }
}
