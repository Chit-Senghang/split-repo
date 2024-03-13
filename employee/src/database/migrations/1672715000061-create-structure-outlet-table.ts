import { MigrationInterface, QueryRunner } from 'typeorm';

export class createStructureOutletTable1672715000061
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "structure_outlet" (
                                "id" SERIAL NOT NULL,
                                "version" integer NOT NULL DEFAULT(0),
                                "name" VARCHAR(255) NOT NULL,
                                "updated_by" integer,
                                "created_by" integer,
                                "created_at" TIMESTAMPTZ DEFAULT now(),
                                "updated_at" TIMESTAMPTZ DEFAULT now(),
                                "deleted_at" TIMESTAMPTZ,
                                CONSTRAINT "pk_structure_outlet_id" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(`
                  CREATE UNIQUE INDEX "uk_structure_outlet_name" ON "structure_outlet" ("name")
                  WHERE
                    deleted_at is NULL;
                `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "structure_outlet"`);
  }
}
