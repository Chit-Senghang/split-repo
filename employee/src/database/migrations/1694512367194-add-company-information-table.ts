import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyInformationTable1694512367194
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "company_information" (
            "id" SERIAL NOT NULL,
            "version" INTEGER NOT NULL DEFAULT(0),
            "name_en" VARCHAR(255) NULL,
            "name_kh" VARCHAR(255) NULL,
            "address_en" VARCHAR(255) NULL,
            "address_kh" VARCHAR(255) NULL,
            "phone_number" VARCHAR(20) NULL,
            "email_address" VARCHAR(255) NULL,
            "updated_by" INTEGER,
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "deleted_at" TIMESTAMPTZ,
            CONSTRAINT "pk_company_information" PRIMARY KEY ("id"))
            `
    );
  }

  async down(): Promise<void> {
    return;
  }
}
