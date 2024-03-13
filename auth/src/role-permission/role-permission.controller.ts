import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ROLE_PERMISSION_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/role-permission.enum';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolePermissionService } from './role-permission.service';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('role-permission')
@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @UseGuards(PermissionGuard(ROLE_PERMISSION_PERMISSION.UPDATE_ROLE_PERMISSION))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':roleId/permission/:permissionId')
  addPermissionToRole(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Param('roleId', ParseIntPipe) roleId: number
  ) {
    return this.rolePermissionService.attachPermissionToRole(
      roleId,
      permissionId
    );
  }

  @UseGuards(PermissionGuard(ROLE_PERMISSION_PERMISSION.DELETE_ROLE_PERMISSION))
  @Delete(':roleId/permission/:permissionId')
  removePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number
  ) {
    return this.rolePermissionService.removePermissionFromRole(
      roleId,
      permissionId
    );
  }
}
