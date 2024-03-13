import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationAlterUserRole1659607152403
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD
        CONSTRAINT "fk_role_id_role_id" FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "fk_role_id_role_id"`
    );
  }
}
