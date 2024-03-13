import { Inject, Injectable } from '@nestjs/common';
import { getCurrentUserFromContext } from '../../shared-resources/utils/get-user-from-current-context.common';
import { CreateUserDashboardCustomizationDto } from './dto/create-user-dashboard-customization.dto';
import { UpdateUserDashboardCustomizationDto } from './dto/update-user-dashboard-customization.dto';
import { UserDashboardCustomization } from './entities/user-dashboard-customization.entity';
import { UserDashboardCustomizationRepository } from './repository/user-dashboard-customization.repository';
import { IUserDashboardCustomizationRepository } from './repository/interfaces/user-dashboard-customization.interface';

@Injectable()
export class UserDashboardCustomizationService {
  constructor(
    @Inject(UserDashboardCustomizationRepository)
    private readonly userDashboardCustomizationRepo: IUserDashboardCustomizationRepository
  ) {}

  async create(
    createUserDashboardCustomizationDto: CreateUserDashboardCustomizationDto
  ): Promise<UserDashboardCustomization> {
    const userId = getCurrentUserFromContext();

    // validate report id whether it exists in enum or not
    this.userDashboardCustomizationRepo.validateReportId(
      createUserDashboardCustomizationDto.reportId
    );

    const userDashboardCustomizationEntity =
      this.userDashboardCustomizationRepo.create({
        ...createUserDashboardCustomizationDto,
        userId
      });

    return await this.userDashboardCustomizationRepo.save(
      userDashboardCustomizationEntity
    );
  }

  async findAll(): Promise<UserDashboardCustomization[]> {
    const userId = getCurrentUserFromContext();
    return await this.userDashboardCustomizationRepo.find({
      where: {
        userId
      }
    });
  }

  async update(
    updateUserDashboardCustomizationDto: UpdateUserDashboardCustomizationDto
  ): Promise<void> {
    await this.userDashboardCustomizationRepo.updateUserDashboardByPutMethod(
      updateUserDashboardCustomizationDto
    );
  }

  async delete(id: number): Promise<void> {
    await this.userDashboardCustomizationRepo.getUserDashboardCustomizationById(
      id
    );
    await this.userDashboardCustomizationRepo.delete(id);
  }
}
