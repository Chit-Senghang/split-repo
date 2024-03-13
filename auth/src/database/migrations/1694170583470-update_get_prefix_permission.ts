import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGetPrefixPermission1694170583470
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            UPDATE permission SET name = 'READ_REQUEST_WORK_FLOW_TYPE' WHERE name = 'GET_REQUEST_WORK_FLOW_TYPE';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
