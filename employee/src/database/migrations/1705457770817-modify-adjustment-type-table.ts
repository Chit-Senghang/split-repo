import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyAdjustmentTypeTable1705457770817
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE adjustment_type
        ADD COLUMN is_system_defined BOOLEAN NOT NULL DEFAULT(false),
        ADD COLUMN version INTEGER DEFAULT 0,
        ADD COLUMN "updated_by" INTEGER,
        ADD COLUMN "created_by" INTEGER,
        ADD COLUMN "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        ADD COLUMN deleted_at TIMESTAMPTZ NULL,
        ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT now();
    `);

    // add new type
    await queryRunner.query(`
        INSERT INTO adjustment_type (name, is_system_defined)
        VALUES ('Movement',true);
    `);

    //set previous seeding records to system defined = true
    await queryRunner.query(`
        UPDATE adjustment_type
        SET is_system_defined = true
        WHERE name IN('Movement','Initiate');
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
