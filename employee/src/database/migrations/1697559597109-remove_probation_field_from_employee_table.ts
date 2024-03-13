import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProbationFieldFromEmployeeTable1697559597109
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DO $$
        
            DECLARE employees CURSOR FOR
                SELECT id,pass_probation_status FROM employee;
            BEGIN
                FOR empRecord IN employees
                    LOOP
                        IF empRecord.pass_probation_status = 'IN_PROBATION' THEN
                            UPDATE employee SET status = 'IN_PROBATION' WHERE id = empRecord.id;
                        ELSEIF empRecord.pass_probation_status = 'FAILED' THEN
                                UPDATE employee SET status = 'FAILED_PROBATION' WHERE id = empRecord.id;
                        ELSEIF empRecord.pass_probation_status = 'PASSED' THEN
                                UPDATE employee SET status = 'ACTIVE' WHERE id = empRecord.id;
                        END IF;
                    END LOOP;
            END;
        $$;
        ALTER TABLE employee DROP COLUMN pass_probation_status;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
