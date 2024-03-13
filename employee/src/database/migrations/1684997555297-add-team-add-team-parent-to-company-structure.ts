import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamAddTeamParentToCompanyStructure1684997555297
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "company_structure_team";
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
