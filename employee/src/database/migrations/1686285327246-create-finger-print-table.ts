import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFingerPrintTable1686285327246 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE fingerprint_device(
            "id" SERIAL not null,
            "description" VARCHAR,
            "model_name" VARCHAR(50) NOT NULL,
            "ip_address" VARCHAR(50) NOT NULL,
            "specification" VARCHAR,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint "pk_finger_print_device_id" PRIMARY KEY ("id"),
            constraint "unique_ip_address" UNIQUE ("ip_address")
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
