import { DataSource, In, Not, QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { UserDashboardCustomization } from '../entities/user-dashboard-customization.entity';
import { ResourceNotFoundException } from '../../../shared-resources/exception';
import { UpdateUserDashboardCustomizationDto } from '../dto/update-user-dashboard-customization.dto';
import { getCurrentUserFromContext } from '../../../shared-resources/utils/get-user-from-current-context.common';
import { ReportEnum } from '../../enums/report.enum';
import { IUserDashboardCustomizationRepository } from './interfaces/user-dashboard-customization.interface';

@Injectable()
export class UserDashboardCustomizationRepository
  extends RepositoryBase<UserDashboardCustomization>
  implements IUserDashboardCustomizationRepository
{
  private readonly USER_DASHBOARD_CUSTOMIZATION =
    'user dashboard customization';

  private readonly REPORT = 'report';

  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(UserDashboardCustomization));
  }

  async updateUserDashboardByPutMethod(
    updateUserDashboardCustomizationDto: UpdateUserDashboardCustomizationDto
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const userId = getCurrentUserFromContext();
    try {
      const userDashboardCustomizationIds: number[] = [];
      for (const userDashboardCustomizationDto of updateUserDashboardCustomizationDto.dashboards) {
        await this.getUserDashboardCustomizationById(
          userDashboardCustomizationDto.id
        );

        await queryRunner.manager.save(
          UserDashboardCustomization,
          userDashboardCustomizationDto
        );

        userDashboardCustomizationIds.push(userDashboardCustomizationDto.id);
      }

      await this.deleteDashboards(
        userId,
        userDashboardCustomizationIds,
        queryRunner
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserDashboardCustomizationById(
    id: number
  ): Promise<UserDashboardCustomization> {
    const userDashboardCustomization: UserDashboardCustomization | null =
      await this.findOneBy({ id });

    if (!userDashboardCustomization) {
      throw new ResourceNotFoundException(
        this.USER_DASHBOARD_CUSTOMIZATION,
        id
      );
    }

    return userDashboardCustomization;
  }

  validateReportId(id: number): void {
    if (!Object.values(ReportEnum).includes(id)) {
      throw new ResourceNotFoundException(this.REPORT, id);
    }
  }

  // ====================== [Private methods] ======================

  private async deleteDashboards(
    userId: number,
    dashboardIds: number[],
    queryRunner: QueryRunner
  ): Promise<void> {
    const userDashboardCustomizations = await this.find({
      where: { id: Not(In(dashboardIds)), userId }
    });

    await Promise.all(
      userDashboardCustomizations.map(
        async (dashboard: UserDashboardCustomization) => {
          await queryRunner.manager.delete(UserDashboardCustomization, {
            id: dashboard.id
          });
        }
      )
    );
  }
}
