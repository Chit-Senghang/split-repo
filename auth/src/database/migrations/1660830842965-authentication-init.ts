import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationInit1660830842965 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_consumer" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "role" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "role" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "role" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "otp" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "otp" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "role" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "role" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "role" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" DROP COLUMN "deleted_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" DROP COLUMN "updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" DROP COLUMN "created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_consumer" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
  }
}
