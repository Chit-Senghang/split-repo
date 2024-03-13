import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationAlterUserConsumer1659607445831
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `ALTER TABLE "user_consumer" ADD
        CONSTRAINT "fk_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_consumer" DROP CONSTRAINT "fk_user_id_user_id"`
    );
  }
}
