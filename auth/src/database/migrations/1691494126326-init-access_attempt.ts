import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAccessAttempt1691494126326 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "access_attempt" (
            "id" SERIAL NOT NULL,
            "version" integer NOT NULL DEFAULT(0),
            "is_success" BOOLEAN NOT NULL DEFAULT(false),
            "type" VARCHAR(100) NOT NULL,
            "user_id" INTEGER NOT NULL,
            "ip_address" VARCHAR(100) NULL,
            "device_detail" TEXT NULL,
            "updated_by" integer,
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMPTZ,
            CONSTRAINT "pk_access_attempt" PRIMARY KEY ("id"),
            CONSTRAINT "fk_user_id_user" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
          );

          CREATE INDEX uk_is_success_access_attempt ON access_attempt(is_success);
          CREATE INDEX uk_type_access_attempt ON access_attempt(type);
          CREATE INDEX uk_created_at_access_attempt ON access_attempt(created_at);
        `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE access_attempt`);
  }
}
