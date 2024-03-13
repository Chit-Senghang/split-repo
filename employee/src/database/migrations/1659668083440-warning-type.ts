import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeInit1659668083440 implements MigrationInterface {
  name = 'employeeInit1659668083440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "warning_type" (
                "id" SERIAL NOT NULL, 
                "version" integer NOT NULL, 
                "name" character varying NOT NULL, 
                "description" character varying, 
                "updated_by" integer, 
                "created_by" integer, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "uk_warning_type_name" UNIQUE ("name"), 
                CONSTRAINT "pk_warning_type_id" PRIMARY KEY ("id")
            );`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "warning_type"`);
  }
}
