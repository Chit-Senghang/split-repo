import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationUser1659606466357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "username" character varying NOT NULL,
        "password" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uk_user_phone" UNIQUE ("phone"),
        CONSTRAINT "pk_user_id" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
