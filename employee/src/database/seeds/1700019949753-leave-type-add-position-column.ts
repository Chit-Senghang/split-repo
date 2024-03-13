import { MigrationInterface, QueryRunner } from 'typeorm';

export class LeaveTypeAddPositionColumn1700019949753
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "leave_type" ADD COLUMN "priority" INTEGER DEFAULT 0;
        `);

    await queryRunner.query(`
            DO $$
                DECLARE leaveTypes CURSOR FOR
                    SELECT id, priority FROM leave_type ORDER BY id ASC;
                i integer := 1;
                BEGIN
                    FOR leaveType IN leaveTypes
                        LOOP
                            UPDATE leave_type SET priority = leaveType.priority + i WHERE id = leaveType.id;
                            i = i + 1;
                        END LOOP;
                END;
            $$;        
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
