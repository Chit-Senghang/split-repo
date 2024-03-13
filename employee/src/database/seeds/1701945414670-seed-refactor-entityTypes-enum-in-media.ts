import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRefactorEntityTypesEnumInMedia1701945414670
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "media" 
                SET "entity_type" = 
            CASE
                WHEN "entity_type" = 'LEAVE' THEN 'LEAVE_REQUEST'
                WHEN "entity_type" = 'EMPLOYEE_INFO' THEN 'UPDATE_EMPLOYEE_ATTACHMENT'
                WHEN "entity_type" = 'EMPLOYEE_WARNING' THEN 'WARNING'
                WHEN "entity_type" = 'EMPLOYEE_MOVEMENT' THEN 'MOVEMENT'
                WHEN "entity_type" = 'EMPLOYEE_RESIGNATION' THEN 'RESIGNATION_REQUEST'
            END
            WHERE "entity_type" IN(
                'LEAVE', 
                'EMPLOYEE_INFO',
                'EMPLOYEE_WARNING',
                'EMPLOYEE_MOVEMENT',
                'EMPLOYEE_RESIGNATION'
            );        
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
