import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { NOTIFICATION_PERMISSION } from '../shared-resources/ts/enum/permission/employee/notification.enum';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationPaginationDto } from './dto/notification-pagination.dto';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(NOTIFICATION_PERMISSION.READ_NOTIFICATION))
  @Get()
  findAll(@Query() pagination: NotificationPaginationDto) {
    return this.notificationService.findAll(pagination);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(NOTIFICATION_PERMISSION.READ_NOTIFICATION))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationService.findOne(id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(NOTIFICATION_PERMISSION.UPDATE_NOTIFICATION))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @UseGuards(PermissionGuard(NOTIFICATION_PERMISSION.UPDATE_NOTIFICATION))
  @Patch('/update/read-all')
  updateReadAll() {
    return this.notificationService.updateReadAll();
  }
}
