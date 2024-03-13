import { MigrationInterface, QueryRunner } from 'typeorm';

export class approvalStatusTrackingInit1672210248148
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "approval_status" (
          "id" SERIAL NOT NULL,
          "version" INTEGER NOT NULL DEFAULT(0),
          "approval_workflow_id" INTEGER NOT NULL,
          "request_workflow_type_id" INTEGER NOT NULL,
          "entity_id" INTEGER NOT NULL,
          "request_to_update_by" INTEGER NULL,
          "request_to_update_json" VARCHAR(255) NULL,
          "request_to_update_changes" VARCHAR(255) NULL,
          "first_approval_user_id" INTEGER,
          "second_approval_user_id" INTEGER,
          "status" VARCHAR(10) NOT NULL DEFAULT('PENDING'),
          "updated_by" INTEGER NULL,
          "updated_at" TIMESTAMP NOT NULL,
          "created_by" INTEGER NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMPTZ,
          CONSTRAINT "pk_approval_status_id" PRIMARY KEY ("id"),
          CONSTRAINT "fk_approval_status_id_request_workflow_type" FOREIGN KEY ("request_workflow_type_id") REFERENCES "request_work_flow_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT "fk_approval_status_id_request_to_update_by" FOREIGN KEY ("request_to_update_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT "fk_approval_status_id_first_approval_user" FOREIGN KEY ("first_approval_user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT "fk_approval_status_id_user" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT "fk_user_id_updated_by" FOREIGN KEY ("updated_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT "fk_approval_status_id_second_approval_user" FOREIGN KEY ("second_approval_user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "approval_status"`);
  }
}
