import { MigrationInterface, QueryRunner } from 'typeorm';

export class geographicInit1672710513778 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "geographic" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "location_code" VARCHAR(10),
            "name_en" VARCHAR(100),
            "name_kh" VARCHAR(100),
            "geographic_type" VARCHAR(10),
            "parent_id" integer,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_geographic" PRIMARY KEY ("id"),
            CONSTRAINT "fk_parent_id_geographic_id" FOREIGN KEY ("parent_id") REFERENCES "geographic" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "geographic"`);
  }
}
