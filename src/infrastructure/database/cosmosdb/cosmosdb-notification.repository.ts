import { Container } from '@azure/cosmos';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateNotificationInput,
  INotificationRepository,
  NotificationFilters,
} from '../../../domain/repositories';
import { Notification, NotificationType } from '../../../domain/entities';
import { CosmosDbService } from '../cosmosdb.service';

type NotificationDocument = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedPostId?: string;
  timestamp: string;
};

@Injectable()
export class CosmosDbNotificationRepository implements INotificationRepository {
  constructor(private readonly cosmosDbService: CosmosDbService) {}

  private getContainer(): Container {
    return this.cosmosDbService.getNotificationsContainer();
  }

  async create(data: CreateNotificationInput): Promise<Notification> {
    const document: NotificationDocument = {
      id: `notif_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.read ?? false,
      relatedPostId: data.relatedPostId,
      timestamp: new Date().toISOString(),
    };

    const { resource } = await this.getContainer().items.create(document);
    return this.toDomain(resource as NotificationDocument);
  }

  async findById(id: string): Promise<Notification | null> {
    const { resources } = await this.getContainer()
      .items.query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    if (resources.length === 0) {
      return null;
    }

    return this.toDomain(resources[0] as NotificationDocument);
  }

  async findByUserId(userId: string, filters?: NotificationFilters): Promise<Notification[]> {
    const conditions: string[] = ['c.userId = @userId'];
    const parameters: Array<{ name: string; value: any }> = [{ name: '@userId', value: userId }];

    if (filters?.read !== undefined) {
      conditions.push('c.read = @read');
      parameters.push({ name: '@read', value: filters.read });
    }

    const query = `SELECT * FROM c WHERE ${conditions.join(' AND ')} ORDER BY c.timestamp DESC`;
    const { resources } = await this.getContainer().items.query({ query, parameters }).fetchAll();
    const notifications = resources.map((resource) =>
      this.toDomain(resource as NotificationDocument),
    );

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 20);
    const start = (page - 1) * limit;
    return notifications.slice(start, start + limit);
  }

  async update(id: string, updates: Partial<Notification>): Promise<Notification> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    const merged: NotificationDocument = {
      id: existing.id,
      userId: existing.userId,
      type: updates.type ?? existing.type,
      title: updates.title ?? existing.title,
      message: updates.message ?? existing.message,
      read: updates.read ?? existing.read,
      relatedPostId: updates.relatedPostId ?? existing.relatedPostId,
      timestamp: existing.timestamp.toISOString(),
    };

    const { resource } = await this.getContainer().item(id, existing.userId).replace(merged);
    return this.toDomain(resource as NotificationDocument);
  }

  async markAllAsReadByUserId(userId: string): Promise<void> {
    const notifications = await this.findByUserId(userId, { limit: 1000 });
    await Promise.all(
      notifications
        .filter((notification) => !notification.read)
        .map((notification) => this.update(notification.id, { read: true })),
    );
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    await this.getContainer().item(id, existing.userId).delete();
  }

  private toDomain(doc: NotificationDocument): Notification {
    return new Notification(
      doc.id,
      doc.userId,
      doc.type,
      doc.title,
      doc.message,
      doc.read,
      new Date(doc.timestamp),
      doc.relatedPostId,
    );
  }
}
