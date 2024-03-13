import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpCode
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { UserDashboardCustomizationService } from './user-dashboard-customization.service';
import { CreateUserDashboardCustomizationDto } from './dto/create-user-dashboard-customization.dto';
import { UpdateUserDashboardCustomizationDto } from './dto/update-user-dashboard-customization.dto';
import { UserDashboardCustomization } from './entities/user-dashboard-customization.entity';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@Controller('report/dashboard')
export class UserDashboardCustomizationController {
  constructor(
    private readonly userDashboardCustomizationService: UserDashboardCustomizationService
  ) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(
    @Body()
    createUserDashboardCustomizationDto: CreateUserDashboardCustomizationDto
  ) {
    return this.userDashboardCustomizationService.create(
      createUserDashboardCustomizationDto
    );
  }

  @ApiOkResponse({ type: getPaginationResponseDto(UserDashboardCustomization) })
  @Get()
  findAll() {
    return this.userDashboardCustomizationService.findAll();
  }

  @Put()
  update(
    @Body()
    updateUserDashboardCustomizationDto: UpdateUserDashboardCustomizationDto
  ) {
    return this.userDashboardCustomizationService.update(
      updateUserDashboardCustomizationDto
    );
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userDashboardCustomizationService.delete(id);
  }
}
