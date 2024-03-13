import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSalaryComponnetTable1689040890027
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE salary_component_type RENAME TO benefit_component_type;
        ALTER TABLE salary_component RENAME TO benefit_component;

        ALTER TABLE benefit_component 
        ADD COLUMN is_system_defined BOOLEAN DEFAULT false; 

        ALTER TABLE benefit_component_type
        ADD COLUMN is_system_defined BOOLEAN DEFAULT false;

        UPDATE benefit_component SET name='BASE SALARY', is_system_defined = true WHERE name = 'BASIC SALARY';
        UPDATE benefit_component_type SET name='BASE SALARY', is_system_defined = true WHERE name = 'BASIC SALARY';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
