import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueOnPostProbationSalary1688451932258
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM employee_post_probation_salary 
        WHERE id IN
            (SELECT id
            FROM 
                (SELECT id,
                 ROW_NUMBER() OVER( PARTITION BY employee_id, salary_component_id
                ORDER BY  id ) AS row_num
                FROM employee_post_probation_salary) t
                WHERE t.row_num > 1 );
        `);

    await queryRunner.query(`
        ALTER TABLE "employee_post_probation_salary"
            ADD CONSTRAINT "uk_employee_post_probation_salary_employee_salary_component" UNIQUE ("employee_id","salary_component_id")
        `);
  }

  async down(): Promise<void> {
    return;
  }
}
