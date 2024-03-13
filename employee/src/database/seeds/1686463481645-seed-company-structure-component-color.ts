import { MigrationInterface, QueryRunner } from 'typeorm';
import { CompanyStructureTypeEnum } from '../../company-structure/common/ts/enum/structure-type.enum';

export class SeedCompanyStructureComponentColor1686463481645
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into code ("code")
        values ('COMPANY_STRUCTURE_COMPONENT');

        insert into code_value ("value", "identifier", "code_id")
        values ('#EAB308', '${CompanyStructureTypeEnum.COMPANY}', (select id from code where code='COMPANY_STRUCTURE_COMPONENT'));

        insert into code_value ("value", "identifier", "code_id")
        values ('#3730A3', '${CompanyStructureTypeEnum.LOCATION}', (select id from code where code='COMPANY_STRUCTURE_COMPONENT'));

        insert into code_value ("value", "identifier", "code_id")
        values ('#9A3412', '${CompanyStructureTypeEnum.OUTLET}', (select id from code where code='COMPANY_STRUCTURE_COMPONENT'));
       
        insert into code_value ("value", "identifier", "code_id")
        values ('#B45309', '${CompanyStructureTypeEnum.DEPARTMENT}', (select id from code where code='COMPANY_STRUCTURE_COMPONENT'));
       
        insert into code_value ("value", "identifier", "code_id")
        values ('#0891B2', '${CompanyStructureTypeEnum.POSITION}', (select id from code where code='COMPANY_STRUCTURE_COMPONENT'));
       
        insert into code_value ("value", "identifier", "code_id")
        values ('#3F6212', '${CompanyStructureTypeEnum.TEAM}', (select id from code where code='COMPANY_STRUCTURE_COMPONENT'));

        insert into code_value ("value", "identifier", "code_id")
        values ('#115E59', 'EMPLOYEE', (select id from code where code='COMPANY_STRUCTURE_COMPONENT'));
       
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
