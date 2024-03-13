import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewReasonTemplateTypes1709018728204
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const reasonTemplateTypes: string[] = [
      'MISSION_REQUEST',
      'MISSED_SCAN_REQUEST',
      'OVERTIME_REQUEST'
    ];

    reasonTemplateTypes.forEach(async (reasonType) => {
      await queryRunner.query(`
            INSERT INTO reason_template (type, name, is_system_defined)
            VALUES ('${reasonType}', '${reasonType}', true);
        `);
    });
  }

  async down(): Promise<void> {
    return;
  }
}
