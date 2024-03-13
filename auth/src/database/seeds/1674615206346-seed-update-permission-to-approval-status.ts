import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedUpdatePermissionToApprovalStatus1674615206346
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'UPDATE_APPROVAL_STATUS_TRACKING', (SELECT id FROM "permission" WHERE name = 'APPROVAL_STATUS_TRACKING'));
        `);
    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,APPROVAL_STATUS_TRACKING,UPDATE_APPROVAL_STATUS_TRACKING'))
            WHERE name = 'UPDATE_APPROVAL_STATUS_TRACKING';
        `);
  }

  async down(): Promise<void> {
    return;
  }
}
