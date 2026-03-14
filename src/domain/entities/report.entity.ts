import { PetSize, PetType, PostStatus, PostType } from '../enums';

export class Report {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public species: PetType,
    public type: PostType,
    public status: PostStatus,
    public description: string,
    public color: string,
    public breed: string,
    public size: PetSize,
    public contact: string,
    public imageUrl: string,
    public lat: number,
    public lon: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly embedding: number[] = [],
  ) {}

  isActive(): boolean {
    return this.status === PostStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = PostStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  markAsResolved(): void {
    this.status = PostStatus.RESOLVED;
    this.updatedAt = new Date();
  }

  update(data: Partial<Omit<Report, 'id' | 'userId' | 'createdAt' | 'embedding'>>): void {
    if (data.species !== undefined) this.species = data.species;
    if (data.type !== undefined) this.type = data.type;
    if (data.status !== undefined) this.status = data.status;
    if (data.description !== undefined) this.description = data.description;
    if (data.color !== undefined) this.color = data.color;
    if (data.breed !== undefined) this.breed = data.breed;
    if (data.size !== undefined) this.size = data.size;
    if (data.contact !== undefined) this.contact = data.contact;
    if (data.imageUrl !== undefined) this.imageUrl = data.imageUrl;
    if (data.lat !== undefined) this.lat = data.lat;
    if (data.lon !== undefined) this.lon = data.lon;
    this.updatedAt = new Date();
  }

  toPlainObject() {
    return {
      id: this.id,
      userId: this.userId,
      species: this.species,
      type: this.type,
      status: this.status,
      description: this.description,
      color: this.color,
      breed: this.breed,
      size: this.size,
      contact: this.contact,
      imageUrl: this.imageUrl,
      lat: this.lat,
      lon: this.lon,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      embedding: this.embedding,
    };
  }

  static fromPlainObject(data: any): Report {
    return new Report(
      data.id,
      data.userId,
      data.species,
      data.type,
      data.status,
      data.description,
      data.color,
      data.breed,
      data.size,
      data.contact,
      data.imageUrl,
      Number(data.lat ?? 0),
      Number(data.lon ?? 0),
      new Date(data.createdAt),
      new Date(data.updatedAt ?? data.createdAt),
      data.embedding ?? [],
    );
  }
}
