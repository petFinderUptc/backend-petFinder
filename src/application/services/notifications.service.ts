import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateNotificationInput,
  INotificationRepository,
  NotificationFilters,
} from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationsRepository: INotificationRepository,
  ) {}

  async findByUserId(userId: string, filters?: NotificationFilters): Promise<Notification[]> {
    return this.notificationsRepository.findByUserId(userId, filters);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar esta notificacion');
    }

    notification.markAsRead();
    await this.notificationsRepository.update(notificationId, notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllAsReadByUserId(userId);
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta notificacion');
    }

    await this.notificationsRepository.delete(notificationId);
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedPostId?: string,
  ): Promise<Notification> {
    const data: CreateNotificationInput = {
      userId,
      type,
      title,
      message,
      relatedPostId,
      read: false,
    };

    return this.notificationsRepository.create(data);
  }
}
