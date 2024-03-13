import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeInit1660884792208 implements MigrationInterface {
  name = 'employeeInit1660884792208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "user_id" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "job_title" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "job_title" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "job_title" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "job_title" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "job_title" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "job_title" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "pay_grade" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "pay_grade" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "pay_grade" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "pay_grade" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "pay_grade" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "pay_grade" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_warning" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_warning" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "warning_type" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_type" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation_reason_template" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "qualification" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "pay_grade" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "pay_grade" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(`ALTER TABLE "pay_grade" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "pay_grade" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "pay_grade" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "pay_grade" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "job_title" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "job_title" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(`ALTER TABLE "job_title" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "job_title" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "job_title" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "job_title" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_status" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "user_id"`);
  }
}
