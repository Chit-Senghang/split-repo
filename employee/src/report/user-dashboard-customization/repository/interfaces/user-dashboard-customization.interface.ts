import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { UpdateUserDashboardCustomizationDto } from '../../dto/update-user-dashboard-customization.dto';
import { UserDashboardCustomization } from '../../entities/user-dashboard-customization.entity';

export interface IUserDashboardCustomizationRepository
  extends IRepositoryBase<UserDashboardCustomization> {
  updateUserDashboardByPutMethod(
    updateUserDashboardCustomizationDto: UpdateUserDashboardCustomizationDto
  ): Promise<void>;

  getUserDashboardCustomizationById(
    id: number
  ): Promise<UserDashboardCustomization>;

  validateReportId(id: number): void;
}
