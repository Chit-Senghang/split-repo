import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationAlterRolePermission1659607351501
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "fk_permission_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "fk_role_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "fk_role_role_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "fk_permission_permission_id"`
    );
  }
}
