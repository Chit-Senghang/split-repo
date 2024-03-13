import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnNameKhToLeaveTypeTable1695882769531
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "leave_type" ADD COLUMN "leave_type_name_kh" VARCHAR(255) NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
