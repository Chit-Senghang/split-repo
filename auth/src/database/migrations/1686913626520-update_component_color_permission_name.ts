import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateComponentColorPermissionName1686913626520
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            UPDATE "permission" SET name = 'COMPANY_STRUCTURE_COMPONENT_COLOR' WHERE name = 'COMPANY_STRUCTURE_COMPONENT';
            UPDATE "permission" SET name = 'READ_COMPANY_STRUCTURE_COMPONENT_COLOR' WHERE name = 'READ_COMPANY_STRUCTURE_COMPONENT';
            UPDATE "permission" SET name = 'UPDATE_COMPANY_STRUCTURE_COMPONENT_COLOR' WHERE name = 'UPDATE_COMPANY_STRUCTURE_COMPONENT';
            UPDATE "permission" SET name = 'DELETE_COMPANY_STRUCTURE_COMPONENT_COLOR' WHERE name = 'DELETE_COMPANY_STRUCTURE_COMPONENT';
            UPDATE "permission" SET name = 'CREATE_COMPANY_STRUCTURE_COMPONENT_COLOR' WHERE name = 'CREATE_COMPANY_STRUCTURE_COMPONENT';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
