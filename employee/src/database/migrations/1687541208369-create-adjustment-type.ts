import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdjustmentType1687541208369 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            create table adjustment_type(
                "id" serial primary key,
                "name" varchar(50) not null
            );

            insert into adjustment_type ("name")
            values ('Promote'),('Demote'),('Transfer'),('Retention'),('Annual');

            alter table payroll_benefit_adjustment
            drop column adjustment_type,
            add column adjustment_type_id integer,
            add constraint fk_adjustment_type_id foreign key (adjustment_type_id) references adjustment_type (id);
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
