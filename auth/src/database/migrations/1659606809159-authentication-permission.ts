import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationPermission1659606809159
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "version" integer NOT NULL,
    "name" character varying NOT NULL,
    "mpath" character varying DEFAULT '',
    "parent_id" integer,
    "updated_by" integer,
    "created_by" integer,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMP,
    CONSTRAINT "uk_permission_name" UNIQUE ("name"),
    CONSTRAINT "uk_permission_name_parent" UNIQUE ("name", "parent_id"),
    CONSTRAINT "fk_parent_id_permission_id" FOREIGN KEY ("parent_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "pk_permission_id" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" DROP CONSTRAINT "fk_parent_id_permission_id"`
    );
    await queryRunner.query(`DROP TABLE "permission"`);
  }
}
