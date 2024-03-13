import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveAttendanceAllowanceToAttendanceFromPayroll1706004305224
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        UPDATE 
            global_configuration 
        SET
            type = 'ATTENDANCE'
        WHERE name = 'attendance-allowance';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
