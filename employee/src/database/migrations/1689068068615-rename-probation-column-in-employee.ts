import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProbationColumnInEmployee1689068068615
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee"
        RENAME COLUMN "probation" TO "is_passed_probation";
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
