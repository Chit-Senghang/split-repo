import { MigrationInterface, QueryRunner } from 'typeorm';

export class createStructureDepartmentTable1672715727225
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "structure_department" (
                                    "id" SERIAL NOT NULL,
                                    "version" integer NOT NULL DEFAULT(0),
                                    "name" VARCHAR(255) NOT NULL,
                                    "updated_by" integer,
                                    "created_by" integer,
                                    "created_at" TIMESTAMPTZ DEFAULT now(),
                                    "updated_at" TIMESTAMPTZ DEFAULT now(),
                                    "deleted_at" TIMESTAMPTZ,
                                    CONSTRAINT "pk_structure_department_id" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(`
                      CREATE UNIQUE INDEX "uk_structure_department_name" ON "structure_department" ("name")
                      WHERE
                        deleted_at is NULL;
                    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "structure_department"`);
  }
}
