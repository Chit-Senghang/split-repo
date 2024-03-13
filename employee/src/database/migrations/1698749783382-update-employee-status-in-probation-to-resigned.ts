import { MigrationInterface, QueryRunner } from 'typeorm';
import { EmployeeStatusEnum } from '../../employee/enum/employee-status.enum';

export class UpdateEmployeeStatusInProbationToResigned1698749783382
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE employee
        SET status = '${EmployeeStatusEnum.RESIGNED}'
        WHERE status = 'FAILED_PROBATION';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
