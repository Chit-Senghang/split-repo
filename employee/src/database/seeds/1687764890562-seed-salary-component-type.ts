import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSalaryComponentType1687764890562
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into salary_component_type ("name", "version", "tax_percentage")
        values ('BASIC SALARY', 1, 10);

        insert into salary_component ("name", "version", "salary_component_type_id")
        values ('BASIC SALARY', 1, (select id from salary_component_type where name='BASIC SALARY'));
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
