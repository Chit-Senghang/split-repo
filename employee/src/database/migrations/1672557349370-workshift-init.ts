import { MigrationInterface, QueryRunner } from 'typeorm';

export class workshiftInit1672557349370 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "workshift_type" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "name" VARCHAR(100) NOT NULL,
            "working_day_qty" integer,
            "is_system_defined" BOOLEAN DEFAULT(FALSE),
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_workshift_type" PRIMARY KEY ("id"),
            CONSTRAINT "uk_name_workshift_type" UNIQUE ("name")
        )
    `);
    await queryRunner.query(`
        INSERT INTO "workshift_type" 
        (name,working_day_qty)
        VALUES
        ('NORMAL',24),
        ('ROSTER',26)
    `);
    await queryRunner.query(`
        CREATE TABLE "working_shift" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "workshift_type_id" integer NOT NULL,
            "name" VARCHAR(255) NOT NULL,
            "start_working_time" TIME NOT NULL,
            "end_working_time" TIME NOT NULL,
            "scan_type" integer NOT NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_working_shift" PRIMARY KEY ("id"),
            CONSTRAINT "fk_workshift_type_id_workshift_type_id" FOREIGN KEY ("workshift_type_id") REFERENCES "workshift_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )   
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_workshift_type_name" ON "working_shift" ("name","workshift_type_id")
        WHERE
            deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "workshift_type"`);
    await queryRunner.query(`DROP TABLE "working_shift"`);
  }
}
