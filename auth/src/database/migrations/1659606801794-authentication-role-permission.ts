import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationRolePermission1659606801794
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "role_permission" (
      "id" SERIAL NOT NULL,
      "version" integer NOT NULL,
      "permission_id" integer,
      "role_id" integer,
      "updated_by" integer,
      "created_by" integer,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP,
      CONSTRAINT "uk_role_permission_permission_role" UNIQUE ("permission_id", "role_id"),
      CONSTRAINT "pk_role_permission_id" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "role_permission"`);
  }
}
