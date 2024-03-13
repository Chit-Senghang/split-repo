import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitLeaveStockDetail1700669517280 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE leave_stock_detail (
            id SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            deleted_at timestamptz NULL,
            leave_stock_id INTEGER NOT NULL,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            leave_day DECIMAL NOT NULL,
            type VARCHAR NOT NULL,
            CONSTRAINT pk_leave_stock_detail_id PRIMARY KEY ("id"),
            CONSTRAINT fk_leave_stock_id_leave_stock FOREIGN KEY(leave_stock_id) REFERENCES leave_stock(id)
        );
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
