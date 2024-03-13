import { MigrationInterface, QueryRunner } from 'typeorm';

export class employePayGrade1659596046730 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pay_grade" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "name" character varying NOT NULL,
        "min_salary" integer NOT NULL,
        "max_salary" integer NOT NULL,
        "currency_id" integer,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "pk_pay_grade_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_currency_id_key_value_id" FOREIGN KEY ("currency_id") REFERENCES "key_value"("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pay_grade"`);

    await queryRunner.query(
      `ALTER TABLE "pay_grade" DROP CONSTRAINT "fk_currency_id_key_value_id"`
    );
  }
}
