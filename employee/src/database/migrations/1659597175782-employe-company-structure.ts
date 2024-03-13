import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeCompanyStructure1659597175782
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_structure" ADD
        CONSTRAINT "fk_employee_head_id_company_structure_id" 
        FOREIGN KEY ("employee_head_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_structure" DROP CONSTRAINT "fk_employee_head_id_company_structure_id"`
    );

    await queryRunner.query(`DROP TABLE "company_structure"`);
  }
}
