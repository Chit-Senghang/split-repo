import { MigrationInterface, QueryRunner } from 'typeorm';

export class requestApprovalWorkflowInit1671789144354
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "request_approval_workflow" (
            "id" SERIAL NOT NULL,
            "version" integer NOT NULL DEFAULT(0),
            "request_workflow_type_id" integer NOT NULL,
            "description" character varying NULL,
            "enable" boolean NOT NULL DEFAULT(TRUE),
            "updated_by" integer,
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMPTZ,
            CONSTRAINT "pk_request_approval_workflow_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_request_approval_workflow_id_request_workflow_type_id" FOREIGN KEY ("request_workflow_type_id") REFERENCES "request_work_flow_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_user_id_created_by" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_user_id_updated_by" FOREIGN KEY ("updated_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        );
    `);
    await queryRunner.query(`
      CREATE TABLE "request_approval_workflow_level" (
          "id" SERIAL NOT NULL,
          "version" integer NOT NULL DEFAULT(0),
          "request_approval_workflow_id" integer NOT NULL,
          "position_level_id" integer NOT NULL,
          "company_structure_department_id" integer NULL,
          "type" character varying(100) NOT NULL,
          "updated_by" integer,
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "created_by" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMPTZ,
          CONSTRAINT "pk_request_approval_workflow_level_id" PRIMARY KEY ("id"),
          CONSTRAINT "fk_request_approval_workflow_level_id_request_approval_workflow_id" FOREIGN KEY ("request_approval_workflow_id") REFERENCES "request_approval_workflow" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT "fk_user_id_created_by" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT "fk_user_id_updated_by" FOREIGN KEY ("updated_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      );
  `);
    await queryRunner.query(`
    CREATE UNIQUE INDEX "uk_request_approval_workflow_level_position_level" ON "request_approval_workflow_level" ("request_approval_workflow_id","position_level_id","company_structure_department_id","type");
  `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "request_approval_workflow"`);
  }
}
