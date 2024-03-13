import { MigrationInterface, QueryRunner } from 'typeorm';
import { REQUEST_APPROVAL_WORKFLOW_PERMISSION } from '../../shared-resources/ts/enum/permission/authentication/request-approval-workflow-enum';
import { REQUEST_WORKFLOW_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/authentication/request-work-flow-type.enum';

export class requestApprovalWorkflowAndRequestApprovalWorkflowLevel1671856225535
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //*Request Approval Workflow Module Permission
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'REQUEST_APPROVAL_WORKFLOW', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,REQUEST_APPROVAL_WORKFLOW')
        WHERE name = 'REQUEST_APPROVAL_WORKFLOW';
        `);
    for (const data in REQUEST_APPROVAL_WORKFLOW_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'REQUEST_APPROVAL_WORKFLOW'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,REQUEST_APPROVAL_WORKFLOW,${data}'))
            WHERE name = '${data}';
        `);
    }
    //*Request Approval Workflow Type Module Permission
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'REQUEST_WORKFLOW_TYPE', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,REQUEST_WORKFLOW_TYPE')
        WHERE name = 'REQUEST_WORKFLOW_TYPE';
        `);
    for (const data in REQUEST_WORKFLOW_TYPE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'REQUEST_WORKFLOW_TYPE'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,REQUEST_WORKFLOW_TYPE,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
