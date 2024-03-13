import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedVaccinationNamePermission1671251623940
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` INSERT INTO "permission" (id, "version", "name", mpath, parent_id, updated_by, created_by, created_at, updated_at, deleted_at) 
                VALUES(171, 2, 'VACCINATION_NAME', '107.171.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
                (172, 2, 'READ_VACCINATION_NAME', '107.171.172.', 171, NULL, NULL, 'NOW()', 'NOW()', NULL),
                (173, 2, 'CREATE_VACCINATION_NAME', '107.171.173.', 171, NULL, NULL, 'NOW()', 'NOW()', NULL),
                (174, 2, 'UPDATE_VACCINATION_NAME', '107.171.174.', 171, NULL, NULL, 'NOW()', 'NOW()', NULL),
                (175, 2, 'DELETE_VACCINATION_NAME', '107.171.175.', 171, NULL, NULL, 'NOW()', 'NOW()', NULL)
                `
    );
  }

  async down(): Promise<void> {
    return;
  }
}
