import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationInit1659607606200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp" (
        "id" SERIAL NOT NULL, 
        "key" UUID NOT NULL DEFAULT Uuid_generate_v4(), 
        "code" CHARACTER VARYING NOT NULL, 
        CONSTRAINT "pk_otp_id" PRIMARY KEY ("id")
      )`
    );
    await queryRunner.query(`
      ALTER TABLE "user" ADD "phone_verified" boolean NOT NULL DEFAULT false;
      ALTER TABLE "user" ADD "email_verified" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email_verified"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone_verified"`);
    await queryRunner.query(`DROP TABLE "otp"`);
  }
}
