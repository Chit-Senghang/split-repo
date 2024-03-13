import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueToColumnDescriptionCompanyStructure1673411003185
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uk_structure_level_id_structure_type" ON "company_structure" ("structure_level_id", "structure_type")
      WHERE
        deleted_at is NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
