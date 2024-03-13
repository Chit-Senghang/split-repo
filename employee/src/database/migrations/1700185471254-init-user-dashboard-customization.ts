import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserDashboardCustomization1700185471254
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE user_dashboard_customization (
            id SERIAL NOT NULL,
            version INTEGER DEFAULT 0,
            user_id INTEGER NOT NULL,
            report_id INTEGER NOT NULL,
            size_weight DECIMAL NOT NULL DEFAULT(0),
            size_height DECIMAL NOT NULL DEFAULT(0),
            layout_weight DECIMAL NOT NULL DEFAULT(0),
            layout_height DECIMAL NOT NULL DEFAULT(0),
            layout_x DECIMAL NOT NULL DEFAULT(0),
            layout_y DECIMAL NOT NULL DEFAULT(0),
            CONSTRAINT pk_user_dashboard_customization_id PRIMARY KEY ("id")
        );
    `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX uk_user_id_report_id ON user_dashboard_customization(user_id,report_id);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
