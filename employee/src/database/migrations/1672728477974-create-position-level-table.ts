import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPositionLevelTable1672728477974
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "position_level" (
                "id" SERIAL NOT NULL,
                "version" integer NOT NULL DEFAULT(0),
                "level_title" VARCHAR(255) NOT NULL,
                "level_number" integer NOT NULL DEFAULT(0),
                "updated_by" integer,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMPTZ,
                CONSTRAINT "pk_position_level_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_position_level_level_title" ON "position_level" ("level_title")
        WHERE
          deleted_at is NULL;
        CREATE UNIQUE INDEX "uk_position_level_level_number" ON "position_level" ("level_number")
        WHERE
          deleted_at is NULL;
        `);
    await queryRunner.query(
      `INSERT INTO position_level
            (
              "level_title",
              "level_number",
              "created_by"
            )
          VALUES
            ('CHIEF',0,NULL),
            ('HEAD OF DEPARTMENT',1,NULL),
            ('MANAGER, DEPUTY MANAGER',2,NULL),
            ('SUPERVISOR',3,NULL),
            ('SENIOR OFFICER, OFFICER',4,NULL),
            ('CREW',5,NULL),
            ('INTERN',6,NULL)
            `
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "position_level"`);
  }
}
