import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMasterPayrollTable1688532717881
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table payroll_master (
            id serial not null primary key,
            total decimal not null,
            date timestamp not null,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP
        );

        create table payroll_by_store (
          id serial not null primary key,
          payroll_master_id integer not null,
          total decimal not null,
          date timestamp not null,
          "version" INTEGER default 0,
          "updated_by" integer,
          "created_by" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP,
          constraint fk_payroll_master_id foreign key (payroll_master_id) references payroll_master (id)
        );

        alter table payroll_report
        add column payroll_by_store_id integer,
        add constraint fk_payroll_by_store_id foreign key (payroll_by_store_id) references payroll_by_store (id);

        create table nssf_master (
            id serial not null primary key,
            total decimal not null,
            date timestamp not null,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP
        );

        create table seniority_master (
            id serial not null primary key,
            total decimal not null,
            date timestamp not null,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP
        );

    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
