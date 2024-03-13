import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableAttendanceReport1686044200907
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(`
        alter table attendance_report 
        add column mission boolean default false;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
