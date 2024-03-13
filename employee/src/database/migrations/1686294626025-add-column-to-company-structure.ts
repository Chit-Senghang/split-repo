import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToCompanyStructure1686294626025
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      ALTER TABLE "company_structure" 
      DROP COLUMN "fingerprint_ip_address",
      ADD COLUMN "fingerprint_device_id" integer default NULL,
      add CONSTRAINT "fk_finger_print_device_id" FOREIGN KEY ("fingerprint_device_id") REFERENCES "fingerprint_device" ("id");
    `
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
