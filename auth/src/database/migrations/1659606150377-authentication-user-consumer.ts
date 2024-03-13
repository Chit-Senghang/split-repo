import { MigrationInterface, QueryRunner } from 'typeorm';

export class userConsumer1659606150377 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "user_consumer" (
      "id" SERIAL NOT NULL,
      "version" integer NOT NULL,
      "consumer_id" character varying NOT NULL,
      "user_id" integer,
      "updated_by" integer,
      "created_by" integer,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP,
      CONSTRAINT "uk_user_consumer_consumer_id" UNIQUE ("consumer_id"),
      CONSTRAINT "REL_1426e777516426223cd5193ed0" UNIQUE ("user_id"),
      CONSTRAINT "pk_user_consumer_id" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_consumer"`);
  }
}
