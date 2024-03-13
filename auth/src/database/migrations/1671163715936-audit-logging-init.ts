import { MigrationInterface, QueryRunner } from 'typeorm';

export class auditLoggingInit1671163715936 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_log" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL DEFAULT(0),
        "request_method" character varying(10) NOT NULL,
        "request_url" character varying NOT NULL,
        "request_json" character varying NULL,
        "ip_address" character varying(100) NULL,
        "resource_id" integer null,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "pk_audit_log_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_user_id_created_by" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit-log"`);
  }
}
