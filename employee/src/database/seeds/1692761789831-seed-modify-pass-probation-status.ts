import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedModifyPassProbationStatus1692761789831
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // modify default IN_PROBATION
    await queryRunner.manager.query(`
        ALTER TABLE ONLY employee
        ALTER COLUMN pass_probation_status SET DEFAULT 'IN_PROBATION'
    `);

    await queryRunner.manager.query(`
        -- IN_PROBATION
        UPDATE 
            employee
        SET 
            pass_probation_status = 'IN_PROBATION'
        WHERE pass_probation_status IS NULL;

        -- PASSED
        UPDATE 
            employee
        SET 
            pass_probation_status = 'PASSED'
        WHERE pass_probation_status = true::character varying;

        -- FAILED
        UPDATE 
            employee
        SET 
            pass_probation_status = 'FAILED'
        WHERE pass_probation_status = false::character varying;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
