import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePermission1689062722661 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        update "permission" 
        set name = 'BENEFIT_COMPONENT'
        where name = 'SALARY_COMPONENT';

        update "permission" 
        set name = 'READ_BENEFIT_COMPONENT'
        where name = 'READ_SALARY_COMPONENT';

        update "permission" 
        set name = 'CREATE_BENEFIT_COMPONENT'
        where name = 'CREATE_SALARY_COMPONENT';

        update "permission" 
        set name = 'UPDATE_BENEFIT_COMPONENT'
        where name = 'UPDATE_SALARY_COMPONENT';

        update "permission" 
        set name = 'DELETE_BENEFIT_COMPONENT'
        where name = 'DELETE_SALARY_COMPONENT';

        update "permission" 
        set name = 'BENEFIT_COMPONENT_TYPE'
        where name = 'SALARY_COMPONENT_TYPE';

        update "permission" 
        set name = 'READ_BENEFIT_COMPONENT_TYPE'
        where name = 'READ_SALARY_COMPONENT_TYPE';

        update "permission" 
        set name = 'CREATE_BENEFIT_COMPONENT_TYPE'
        where name = 'CREATE_SALARY_COMPONENT_TYPE';

        update "permission" 
        set name = 'UPDATE_BENEFIT_COMPONENT_TYPE'
        where name = 'UPDATE_SALARY_COMPONENT_TYPE';

        update "permission" 
        set name = 'DELETE_BENEFIT_COMPONENT_TYPE'
        where name = 'DELETE_SALARY_COMPONENT_TYPE';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
