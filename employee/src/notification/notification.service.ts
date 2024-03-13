import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationPaginationDto } from './dto/notification-pagination.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification: Notification = this.notificationRepo.create({
      ...createNotificationDto,
      approvalStatus: { id: createNotificationDto.approvalStatusId }
    });

    await this.notificationRepo.save(notification);
  }

  async findAll(pagination: NotificationPaginationDto) {
    const userId = getCurrentUserFromContext();
    const data = await GetPagination(this.notificationRepo, pagination, [], {
      where: {
        userId,
        approvalStatus: { id: pagination.approvalStatusId }
      },
      relation: { approvalStatus: true },
      select: { approvalStatus: { id: true, entityId: true } }
    });

    let isNotReadCount = 0;
    if (data.data.length) {
      isNotReadCount = data.data
        .map((notification: Notification) => {
          notification.title = JSON.parse(notification.title);
          return notification;
        })
        .filter((notification: Notification) => !notification.isRead).length;
    }

    return {
      data: [{ isNotReadCount }, ...data.data],
      totalCount: data.totalCount
    };
  }

  async findOne(id: number): Promise<Notification> {
    const notification: Notification = await this.notificationRepo.findOne({
      where: { id },
      relations: { approvalStatus: true }
    });
    if (!notification) {
      throw new ResourceNotFoundException('notification', id);
    }
    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    const notification: Notification = await this.findOne(id);
    return await this.notificationRepo.save(
      Object.assign(notification, updateNotificationDto)
    );
  }

  async updateReadAll() {
    const userId: number = getCurrentUserFromContext();
    const notifications: Notification[] = await this.notificationRepo.find({
      where: { userId, isRead: false }
    });

    // if there are notifications, update all to already read with a single transaction
    if (notifications.length) {
      notifications.forEach(
        (notification: Notification) => (notification.isRead = true)
      );
      await this.notificationRepo.save(notifications);
    }
  }

  async findOneByUserIdAndApprovalStatusId(
    approvalStatusId: number,
    userId: number
  ): Promise<Notification> {
    return await this.notificationRepo.findOne({
      where: { userId, approvalStatus: { id: approvalStatusId } }
    });
  }
}
