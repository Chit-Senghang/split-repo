import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PERMISSION } from '../shared-resources/ts/enum/permission';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(PermissionGuard(PERMISSION.READ_PERMISSION))
  @ApiOkResponse({ type: Permission, isArray: true })
  @Get()
  getALlPermission() {
    return this.permissionService.getAllRolePermission();
  }
}
