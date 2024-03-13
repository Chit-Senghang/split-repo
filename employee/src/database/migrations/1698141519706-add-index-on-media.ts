import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexOnMedia1698141519706 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX index_entity_type_entity_id ON media (entity_type,entity_id);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
