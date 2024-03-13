import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeCompanyStructure1659596304432
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "company_structure" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "name" character varying NOT NULL,
        "type" character varying NOT NULL,
        "detail" character varying NOT NULL,
        "address" character varying NOT NULL,
        "parent_id" integer,
        "employee_head_id" integer,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uk_company_structure_name_parent" UNIQUE ("name", "type", "parent_id"),
        CONSTRAINT "pk_company_structure_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_parent_id_company_structure_id" FOREIGN KEY ("parent_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );

    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD "mpath" character varying DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP CONSTRAINT "fk_parent_id_company_structure_id"`
    );

    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP COLUMN "mpath"`
    );
  }
}
