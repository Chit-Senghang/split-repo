import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationInit1660728320412 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otp" ADD "phone" character varying`);
    await queryRunner.query(`ALTER TABLE "otp" ADD "email" character varying`);
    await queryRunner.query(
      `ALTER TABLE "otp" ADD "expire_at" TIMESTAMP WITH TIME ZONE NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "is_self_service" SET DEFAULT true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "is_self_service" SET DEFAULT false`
    );
    await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "expire_at"`);
    await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "phone"`);
  }
}
