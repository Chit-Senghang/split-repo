import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEmployeeContractTypeForExistingData1697779295000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE employee SET contract_type = 'UDC_24' WHERE contract_type = 'UDC 24';
        UPDATE employee SET contract_type = 'UDC_26' WHERE contract_type = 'UDC 26';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
