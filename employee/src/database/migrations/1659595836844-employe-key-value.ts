import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeKeyValue1659595836844 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "key" (
        "id" SERIAL NOT NULL,
        "code" character varying NOT NULL,
        CONSTRAINT "uk_key_code" UNIQUE ("code"),
        CONSTRAINT "pk_key_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "key_value" (
        "id" SERIAL NOT NULL,
        "value" character varying NOT NULL,
        "identifier" character varying,
        "enable" boolean NOT NULL DEFAULT false,
        "key_id" integer,
        CONSTRAINT "pk_key_value_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_key_id_key_id" FOREIGN KEY ("key_id") REFERENCES "key" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "key_value" DROP CONSTRAINT "fk_key_id_key_id"`
    );
    await queryRunner.query(`DROP TABLE "key"`);

    await queryRunner.query(`DROP TABLE "key_value"`);
  }
}
