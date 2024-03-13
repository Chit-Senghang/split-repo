import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { GLOBAL_CONFIGURATION_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/global-configuration.enum';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PaginationQueryGlobalConfigurationDto } from './dto/pagination-global-configuration.dto';
import { UpdateGlobalConfigurationDto } from './dto/update-global-configuration.dto';
import { GlobalConfiguration } from './entities/global-configuration.entity';
import { GlobalConfigurationService } from './global-configuration.service';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('global-configuration')
@Controller('global-configuration')
export class GlobalConfigurationController {
  constructor(
    private readonly globalConfigurationService: GlobalConfigurationService
  ) {}

  @UseGuards(
    PermissionGuard(GLOBAL_CONFIGURATION_PERMISSION.READ_GLOBAL_CONFIGURATION)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(GlobalConfiguration) })
  @Get()
  findAll(
    @Query()
    paginationQueryGlobalConfigurationDto: PaginationQueryGlobalConfigurationDto
  ) {
    return this.globalConfigurationService.findAll(
      paginationQueryGlobalConfigurationDto
    );
  }

  @UseGuards(
    PermissionGuard(GLOBAL_CONFIGURATION_PERMISSION.READ_GLOBAL_CONFIGURATION)
  )
  @Get('all-type')
  getAllType() {
    return this.globalConfigurationService.getAllType();
  }

  @UseGuards(
    PermissionGuard(GLOBAL_CONFIGURATION_PERMISSION.UPDATE_GLOBAL_CONFIGURATION)
  )
  @ApiOkResponse({ type: GlobalConfiguration })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.globalConfigurationService.findGlobalConfigById(id);
  }

  @UseGuards(
    PermissionGuard(GLOBAL_CONFIGURATION_PERMISSION.UPDATE_GLOBAL_CONFIGURATION)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateGlobalConfigurationDto: UpdateGlobalConfigurationDto
  ) {
    return this.globalConfigurationService.update(
      id,
      updateGlobalConfigurationDto
    );
  }
}
