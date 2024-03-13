import { MigrationInterface, QueryRunner } from 'typeorm';

export class initMedia1675918377564 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media" (
            "id" SERIAL NOT NULL,
            "version" INTEGER NOT NULL DEFAULT(0),
            "entity_type" VARCHAR(100) NOT NULL,
            "mime_type" VARCHAR(100) NOT NULL,
            "name" VARCHAR NOT NULL,
            "filename" VARCHAR NOT NULL,
            "description" VARCHAR NULL,
            "entity_id" INTEGER NOT NULL,
            "size" INTEGER NOT NULL,
            "updated_by" INTEGER,
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "created_by" INTEGER,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMPTZ,
            CONSTRAINT "pk_media" PRIMARY KEY ("id"))
        `
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "media"`);
  }
}
