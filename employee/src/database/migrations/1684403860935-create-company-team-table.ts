import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyTeamTable1684403860935 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      create table company_structure_team (
        "id" SERIAL NOT NULL,
        "company_structure_id" integer not null,
        "company_structure_component_id" integer not null,
        "updated_by" integer,
        "created_by" integer,
        "version" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        constraint "unique_company_structure_team" unique ("company_structure_id","company_structure_component_id"),
        constraint "pk_company_structure_team_id" primary key ("id"),
        CONSTRAINT "fk_company_structure_id" FOREIGN KEY ("company_structure_id") REFERENCES "company_structure" ("id"),
        CONSTRAINT "fk_company_structure_component_id" FOREIGN KEY ("company_structure_component_id") REFERENCES "company_structure_component" ("id")
    );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
