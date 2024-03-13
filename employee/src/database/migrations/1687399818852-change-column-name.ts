import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeColumnName1687399818852 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table leave_type_variation 
        rename "genderId" to gender_id;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
