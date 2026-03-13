export enum NotificationType {
  CONTACT = 'contact',
  UPDATE = 'update',
  MESSAGE = 'message',
  SYSTEM = 'system',
}

export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public type: NotificationType,
    public title: string,
    public message: string,
    public read: boolean,
    public readonly timestamp: Date,
    public relatedPostId?: string,
  ) {}

  markAsRead(): void {
    this.read = true;
  }
}
