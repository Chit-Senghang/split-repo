import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ROLE_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/role.enum';
import { PermissionGuard } from '../common/guards/permission.guard';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';
import { PaginationQueryRoleDto } from './dto/pagination-query-role.dto';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('role')
@Controller('role')
@UseInterceptors(ResponseMappingInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(PermissionGuard(ROLE_PERMISSION.READ_ROLE))
  @ApiOkResponse({ type: getPaginationResponseDto(Role) })
  @Get()
  getAllRole(@Query() pagination: PaginationQueryRoleDto) {
    return this.roleService.getAllRole(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryRoleDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.roleService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(ROLE_PERMISSION.READ_ROLE))
  @ApiOkResponse({ type: Role })
  @Get(':id')
  getSpecificRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Query('includePermission', ParseBoolPipe) includePermission: boolean
  ) {
    return this.roleService.getSpecificRole(roleId, includePermission);
  }

  @UseGuards(PermissionGuard(ROLE_PERMISSION.CREATE_ROLE))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createNewRole(createRoleDto);
  }

  @UseGuards(PermissionGuard(ROLE_PERMISSION.UPDATE_ROLE))
  @ApiOkResponse({ type: IdResponseDto })
  @Put(':id')
  async updateSpecificRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.roleService.updateRole(id, updateRoleDto);
  }
}
