import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Headers,
  Delete,
  UseGuards,
  HttpCode,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../common/guards/permission.guard';
import { USER_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/user.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UserPaginationQueryDto } from './dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(PermissionGuard(USER_PERMISSION.CREATE_USER))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(PermissionGuard(USER_PERMISSION.DELETE_USER))
  @Delete('/:id/role/:roleId')
  removeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number
  ) {
    return this.userService.removeUserRole(id, roleId);
  }

  @UseGuards(PermissionGuard(USER_PERMISSION.CREATE_USER))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:id/role/:roleId')
  addUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number
  ) {
    return this.userService.addUserRole(id, roleId);
  }

  @UseGuards(PermissionGuard(USER_PERMISSION.UPDATE_USER))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(USER_PERMISSION.READ_USER))
  @ApiOkResponse({ type: getPaginationResponseDto(User) })
  @Get()
  getAllUser(@Query() pagination: UserPaginationQueryDto) {
    return this.userService.getAllUser(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: UserPaginationQueryDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.userService.exportFile(pagination, exportFileDto);
  }

  @ApiOkResponse({ type: User })
  @Get('current')
  getCurrentUser(@Headers('x-consumer-custom-id') id: string) {
    return this.userService.getCurrentUser(Number(id));
  }

  @UseGuards(PermissionGuard(USER_PERMISSION.READ_USER))
  @ApiOkResponse({ type: IdResponseDto })
  @Get(':id')
  getSpecificUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @UseGuards(PermissionGuard(USER_PERMISSION.DELETE_USER))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.userService.deleteUser({ userId: id });
  }
}
