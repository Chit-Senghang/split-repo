import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationInit1659607606119 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email" character varying NULL;
       ALTER TABLE "user" ADD CONSTRAINT "uk_user_email" UNIQUE ("email");
       ALTER TABLE "user" ADD "is_self_service" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user" DROP COLUMN "is_self_service";
        ALTER TABLE "user" DROP CONSTRAINT "uk_user_email";
        ALTER TABLE "user" DROP COLUMN "email"`);
  }
}
