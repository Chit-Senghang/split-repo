import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSalaryComponent1687312827186 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "salary_component" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "name" VARCHAR(255) NOT NULL,
            "salary_component_type_id" INTEGER NOT NULL,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT "pk_salary_component_id" PRIMARY KEY ("id"),
            CONSTRAINT fk_salary_component_type_id_salary_component_type_id FOREIGN KEY (salary_component_type_id) REFERENCES salary_component_type(id),
            CONSTRAINT uk_salary_component_type_id_name UNIQUE(salary_component_type_id,name)
        )`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABBLE "salary_component";
    `);
  }
}
