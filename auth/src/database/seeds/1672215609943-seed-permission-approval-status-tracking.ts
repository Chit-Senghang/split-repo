import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedPermissionApprovalStatusTracking1672215609943
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'APPROVAL_STATUS_TRACKING', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('AUTHENTICATION_MODULE,APPROVAL_STATUS_TRACKING')
        WHERE name = 'APPROVAL_STATUS_TRACKING';
    `);
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'READ_APPROVAL_STATUS_TRACKING', (SELECT id FROM "permission" WHERE name = 'APPROVAL_STATUS_TRACKING'));
        `);
    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,APPROVAL_STATUS_TRACKING,READ_APPROVAL_STATUS_TRACKING'))
            WHERE name = 'READ_APPROVAL_STATUS_TRACKING';
        `);
  }

  async down(): Promise<void> {
    return;
  }
}
