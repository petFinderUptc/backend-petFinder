import { Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from '../../application/services';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar notificaciones',
    description: 'Notificaciones del usuario con paginación y filtro de leídas',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite por página', type: Number })
  @ApiQuery({ name: 'read', required: false, description: 'Filtrar por leídas', type: Boolean })
  @ApiResponse({ status: 200, description: 'Notificaciones devueltas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  @ApiOperation({
    summary: 'Notificaciones no leídas',
    description: 'Retorna notificaciones no leídas',
  })
  @ApiResponse({ status: 200, description: 'Notificaciones no leídas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getUnread(@CurrentUser() user: UserFromJwt) {
    const notifications = await this.notificationsService.findByUserId(user.id, { read: false });
    return {
      count: notifications.length,
      notifications,
    };
  }

  @Put(':id/read')
  @ApiOperation({
    summary: 'Marcar notificación leída',
    description: 'Marca notificación específica como leída',
  })
  @ApiParam({ name: 'id', description: 'ID de notificación' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async markAsRead(@CurrentUser() user: UserFromJwt, @Param('id') notificationId: string) {
    await this.notificationsService.markAsRead(notificationId, user.id);
    return { message: 'Notificacion marcada como leida' };
  }

  @Put('read-all')
  @ApiOperation({
    summary: 'Marcar todas leídas',
    description: 'Marca todas las notificaciones del usuario como leídas',
  })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async markAllAsRead(@CurrentUser() user: UserFromJwt) {
    await this.notificationsService.markAllAsRead(user.id);
    return { message: 'Todas las notificaciones marcadas como leidas' };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar notificación',
    description: 'Elimina notificación específica',
  })
  @ApiParam({ name: 'id', description: 'ID de notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async delete(@CurrentUser() user: UserFromJwt, @Param('id') notificationId: string) {
    await this.notificationsService.delete(notificationId, user.id);
    return { message: 'Notificacion eliminada' };
  }
}
