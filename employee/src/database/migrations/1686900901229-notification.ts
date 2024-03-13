import { MigrationInterface, QueryRunner } from 'typeorm';

export class Notification1686900901229 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE notification(
            "id" SERIAL NOT NULL,
            "title" VARCHAR NOT NULL,
            "description" VARCHAR(250) NULL,
            "is_read" BOOLEAN NOT NULL DEFAULT(FALSE),
            "user_id" INTEGER NOT NULL,
            "entity_type" VARCHAR NOT NULL,
            "entity_id" INTEGER NULL,
            "approval_status_id" INTEGER NULL,
            "version" INTEGER DEFAULT 0,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint "pk_notification_id" PRIMARY KEY ("id"),
            CONSTRAINT fk_approval_status_id_approval_status_id FOREIGN KEY ("approval_status_id") REFERENCES "approval_status"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "notification";
    `);
  }
}
