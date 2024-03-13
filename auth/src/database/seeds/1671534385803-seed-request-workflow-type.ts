import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    version: 1,
    requestType: 'LEAVE_REQUEST',
    description: 'leave request'
  },
  {
    version: 1,
    requestType: 'MISSION_REQUEST',
    description: 'mission request'
  },
  {
    version: 1,
    requestType: 'OVERTIME_REQUEST',
    description: 'overtime request'
  },
  {
    version: 1,
    requestType: 'BORROW',
    description: 'borrow'
  },
  {
    version: 1,
    requestType: 'PAYBACK_HOUR',
    description: 'payback hour'
  },
  {
    version: 1,
    requestType: 'MISSED_SCAN',
    description: 'missed scan'
  },
  {
    version: 1,
    requestType: 'RESIGNATION_REQUEST',
    description: 'resignation request'
  },
  {
    version: 1,
    requestType: 'MOVEMENT',
    description: 'movement'
  },
  {
    version: 1,
    requestType: 'SALARY_ADJUSTMENT',
    description: 'salary adjustment'
  },
  {
    version: 1,
    requestType: 'EMPLOYEE_INFO_UPDATE',
    description: 'employee info update'
  },
  {
    version: 1,
    requestType: 'WARNING',
    description: 'warning'
  }
] as const;

export class seedRequestWorkflowType1671534385803
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "request_work_flow_type"(
              "id" SERIAL NOT NULL,
              "version" integer NOT NULL DEFAULT(0),
              "request_type" VARCHAR(100),
              "description" VARCHAR(255) NULl,
              "updated_by" integer,
              "created_by" integer,
              "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
              "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
              "deleted_at" TIMESTAMPTZ,
              CONSTRAINT "fk_user_id_update_by" FOREIGN KEY ("updated_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
              CONSTRAINT "pk_request_work_flow_type_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_request_work_flow_type_request_type" ON "request_work_flow_type" ("request_type")
        WHERE
          deleted_at is NULL;
      `);

    for (const data of seedData) {
      await queryRunner.query(`
      INSERT INTO "request_work_flow_type" (version, "request_type", "description")
      VALUES('${data.version}', '${data.requestType}', '${data.description}')
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "request_work_flow_type"`);
  }
}
