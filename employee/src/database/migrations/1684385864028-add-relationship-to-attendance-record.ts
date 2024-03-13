import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationshipToAttendanceRecord1684385864028
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_record"
        ADD CONSTRAINT "fk_company_structure_outlet_id_company_structure_outlet_id" FOREIGN KEY ("company_structure_outlet_id") REFERENCES "company_structure"(id);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
