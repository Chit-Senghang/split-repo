import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyStructureComponentToCompanyStructureComponentColor1686803215682
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        UPDATE code SET code = 'COMPANY_STRUCTURE_COMPONENT_COLOR' WHERE code = 'COMPANY_STRUCTURE_COMPONENT';
        UPDATE code SET code = 'GENDER' WHERE code = 'EMPLOYEE_GENDER';
        UPDATE code SET code = 'MARITAL_STATUS' WHERE code = 'EMPLOYEE_MARITAL_STATUS';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
