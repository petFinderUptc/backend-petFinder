import { Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from '../../application/services';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAll(
    @CurrentUser() user: UserFromJwt,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('read') read?: string,
  ) {
    const normalizedRead = read === undefined ? undefined : read === 'true';
    return this.notificationsService.findByUserId(user.id, {
      page: Number(page),
      limit: Number(limit),
      read: normalizedRead,
    });
  }

  @Get('unread')
  async getUnread(@CurrentUser() user: UserFromJwt) {
    const notifications = await this.notificationsService.findByUserId(user.id, { read: false });
    return {
      count: notifications.length,
      notifications,
    };
  }

  @Put(':id/read')
  async markAsRead(@CurrentUser() user: UserFromJwt, @Param('id') notificationId: string) {
    await this.notificationsService.markAsRead(notificationId, user.id);
    return { message: 'Notificacion marcada como leida' };
  }

  @Put('read-all')
  async markAllAsRead(@CurrentUser() user: UserFromJwt) {
    await this.notificationsService.markAllAsRead(user.id);
    return { message: 'Todas las notificaciones marcadas como leidas' };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: UserFromJwt, @Param('id') notificationId: string) {
    await this.notificationsService.delete(notificationId, user.id);
    return { message: 'Notificacion eliminada' };
  }
}
