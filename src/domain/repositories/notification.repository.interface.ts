import { Notification, NotificationType } from '../entities';

export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedPostId?: string;
  read?: boolean;
}

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, filters?: NotificationFilters): Promise<Notification[]>;
  update(id: string, updates: Partial<Notification>): Promise<Notification>;
  markAllAsReadByUserId(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
