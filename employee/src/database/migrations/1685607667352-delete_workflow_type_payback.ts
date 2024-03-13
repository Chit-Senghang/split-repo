import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteWorkflowTypePayback1685607667352
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            DELETE FROM request_work_flow_type WHERE request_type = 'PAYBACK_HOUR';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
