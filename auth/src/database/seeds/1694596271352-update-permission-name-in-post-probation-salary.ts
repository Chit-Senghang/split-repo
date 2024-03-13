import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePermissionNameInPostProbationSalary1694596271352
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "permission"
            SET "name" = CASE
                            WHEN "name" = 'CRUD_PAYROLL_POST_PROBATION' 
                                THEN 'PAYROLL_POST_PROBATION'
                            WHEN "name" = 'READ_CRUD_PAYROLL_POST_PROBATION'
                                THEN 'READ_PAYROLL_POST_PROBATION'
                            WHEN "name" = 'CREATE_CRUD_PAYROLL_POST_PROBATION'
                                THEN 'CREATE_PAYROLL_POST_PROBATION'
                            WHEN "name" = 'UPDATE_CRUD_PAYROLL_POST_PROBATION' 
                                THEN 'UPDATE_PAYROLL_POST_PROBATION'
                            WHEN "name" = 'DELETE_CRUD_PAYROLL_POST_PROBATION'
                                THEN 'DELETE_PAYROLL_POST_PROBATION'
                        END
            WHERE "name" IN(
                        'CRUD_PAYROLL_POST_PROBATION',
                        'READ_CRUD_PAYROLL_POST_PROBATION',
                        'CREATE_CRUD_PAYROLL_POST_PROBATION',
                        'UPDATE_CRUD_PAYROLL_POST_PROBATION',
                        'DELETE_CRUD_PAYROLL_POST_PROBATION'
        );
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
