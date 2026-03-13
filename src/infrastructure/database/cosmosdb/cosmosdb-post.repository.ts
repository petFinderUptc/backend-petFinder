import { Container } from '@azure/cosmos';
import { Injectable, Logger } from '@nestjs/common';
import { Post } from '../../../domain/entities';
import { PostStatus } from '../../../domain/enums';
import { IPostRepository, PostFilters } from '../../../domain/repositories';
import { CosmosDbService } from '../cosmosdb.service';

@Injectable()
export class CosmosDbPostRepository implements IPostRepository {
  private readonly logger = new Logger(CosmosDbPostRepository.name);

  constructor(private readonly cosmosDbService: CosmosDbService) {}

  private getContainer(): Container {
    return this.cosmosDbService.getPostsContainer();
  }

  async create(post: Post): Promise<Post> {
    const newPost = Post.fromPlainObject({
      ...post.toPlainObject(),
      id: post.id || `post_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { resource } = await this.getContainer().items.create(newPost.toPlainObject());
    this.logger.log(`Post created in Cosmos DB: ${resource?.id}`);
    return this.toDomain(resource);
  }

  async findById(id: string): Promise<Post | null> {
    const { resources } = await this.getContainer()
      .items.query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    if (resources.length === 0) {
      return null;
    }

    return this.toDomain(resources[0]);
  }

  async findAll(): Promise<Post[]> {
    const { resources } = await this.getContainer().items.query('SELECT * FROM c').fetchAll();
    return resources.map((resource) => this.toDomain(resource));
  }

  async findByFilters(filters: PostFilters): Promise<Post[]> {
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: any }> = [];

    if (filters.type) {
      conditions.push('c.type = @type');
      parameters.push({ name: '@type', value: filters.type });
    }

    if (filters.status) {
      conditions.push('c.status = @status');
      parameters.push({ name: '@status', value: filters.status });
    }

    if (filters.petType) {
      conditions.push('c.petType = @petType');
      parameters.push({ name: '@petType', value: filters.petType });
    }

    if (filters.size) {
      conditions.push('c.size = @size');
      parameters.push({ name: '@size', value: filters.size });
    }

    if (filters.city) {
      conditions.push('c.location.city = @city');
      parameters.push({ name: '@city', value: filters.city });
    }

    if (filters.userId) {
      conditions.push('c.userId = @userId');
      parameters.push({ name: '@userId', value: filters.userId });
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM c${whereClause}`;

    const { resources } = await this.getContainer().items.query({ query, parameters }).fetchAll();
    return resources.map((resource) => this.toDomain(resource));
  }

  async findByUserId(userId: string): Promise<Post[]> {
    const { resources } = await this.getContainer()
      .items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }],
      })
      .fetchAll();

    return resources.map((resource) => this.toDomain(resource));
  }

  async update(id: string, postData: Partial<Post>): Promise<Post> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Publicacion no encontrada');
    }

    const merged = {
      ...existing.toPlainObject(),
      ...this.toPlainObject(postData),
      id: existing.id,
      userId: existing.userId,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      location:
        postData.location !== undefined
          ? postData.location.toPlainObject()
          : existing.location.toPlainObject(),
    };

    const { resource } = await this.getContainer().item(id, id).replace(merged);
    return this.toDomain(resource);
  }

  async delete(id: string): Promise<void> {
    await this.getContainer().item(id, id).delete();
  }

  async countActive(): Promise<number> {
    const { resources } = await this.getContainer()
      .items.query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.status = @status',
        parameters: [{ name: '@status', value: PostStatus.ACTIVE }],
      })
      .fetchAll();

    return resources[0] || 0;
  }

  private toDomain(resource: any): Post {
    return Post.fromPlainObject({
      ...resource,
      lostOrFoundDate: new Date(resource.lostOrFoundDate),
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
    });
  }

  private toPlainObject(postData: Partial<Post>): Record<string, unknown> {
    const plain: Record<string, unknown> = {};

    if (postData.type !== undefined) plain.type = postData.type;
    if (postData.status !== undefined) plain.status = postData.status;
    if (postData.petName !== undefined) plain.petName = postData.petName;
    if (postData.petType !== undefined) plain.petType = postData.petType;
    if (postData.breed !== undefined) plain.breed = postData.breed;
    if (postData.color !== undefined) plain.color = postData.color;
    if (postData.size !== undefined) plain.size = postData.size;
    if (postData.age !== undefined) plain.age = postData.age;
    if (postData.description !== undefined) plain.description = postData.description;
    if (postData.images !== undefined) plain.images = postData.images;
    if (postData.contactPhone !== undefined) plain.contactPhone = postData.contactPhone;
    if (postData.contactEmail !== undefined) plain.contactEmail = postData.contactEmail;
    if (postData.lostOrFoundDate !== undefined) plain.lostOrFoundDate = postData.lostOrFoundDate;

    return plain;
  }
}
