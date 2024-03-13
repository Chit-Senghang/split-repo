import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkingHourToWorkingShift1686102779533
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table working_shift 
        add column working_hour integer default 8;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
