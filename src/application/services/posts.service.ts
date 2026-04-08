import { Injectable, NotFoundException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from '../dtos/posts';
import { IPostRepository, PostFilters } from '../../domain/repositories';
import { Post } from '../../domain/entities';
import { PostStatus } from '../../domain/enums';
import { Location } from '../../domain/value-objects';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../../domain/entities';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    const location = new Location(
      createPostDto.location.city,
      createPostDto.location.neighborhood,
      createPostDto.location.address,
      createPostDto.location.coordinates,
    );

    const post = new Post(
      '',
      userId,
      createPostDto.type,
      PostStatus.ACTIVE,
      createPostDto.petType,
      createPostDto.color,
      createPostDto.size,
      createPostDto.description,
      createPostDto.images || [],
      location,
      createPostDto.contactPhone,
      new Date(createPostDto.lostOrFoundDate),
      new Date(),
      new Date(),
      createPostDto.petName,
      createPostDto.breed,
      createPostDto.age,
      createPostDto.contactEmail,
    );

    const savedPost = await this.postRepository.create(post);

    try {
      await this.notificationsService.create(
        userId,
        NotificationType.UPDATE,
        'Reporte publicado',
        `Tu reporte ${savedPost.id} fue creado correctamente.`,
        savedPost.id,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo crear notificacion de creacion para post ${savedPost.id}: ${error.message}`,
      );
    }

    return savedPost;
  }

  async findAll(filters?: FilterPostDto): Promise<Post[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return await this.postRepository.findAll();
    }

    const domainFilters: PostFilters = {
      type: filters.type,
      status: filters.status,
      petType: filters.petType,
      size: filters.size,
      city: filters.city,
    };

    return await this.postRepository.findByFilters(domainFilters);
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return post;
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return await this.postRepository.findByUserId(userId);
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta publicación');
    }

    let location: Location | undefined;
    if (updatePostDto.location) {
      location = new Location(
        updatePostDto.location.city,
        updatePostDto.location.neighborhood,
        updatePostDto.location.address,
        updatePostDto.location.coordinates,
      );
    }

    post.update({
      status: updatePostDto.status,
      petName: updatePostDto.petName,
      breed: updatePostDto.breed,
      color: updatePostDto.color,
      description: updatePostDto.description,
      images: updatePostDto.images,
      location: location,
      contactPhone: updatePostDto.contactPhone,
      contactEmail: updatePostDto.contactEmail,
    });

    const updatedPost = await this.postRepository.update(id, post);

    try {
      await this.notificationsService.create(
        post.userId,
        NotificationType.UPDATE,
        'Tu reporte fue actualizado',
        `Se actualizo la informacion de tu reporte ${post.id}.`,
        post.id,
      );
    } catch (error) {
      this.logger.warn(`No se pudo crear notificacion para post ${post.id}: ${error.message}`);
    }

    return updatedPost;
  }

  async markAsResolved(id: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta publicación');
    }

    post.markAsResolved();
    const updatedPost = await this.postRepository.update(id, post);

    try {
      await this.notificationsService.create(
        post.userId,
        NotificationType.UPDATE,
        'Reporte marcado como resuelto',
        `Tu reporte ${post.id} fue marcado como resuelto.`,
        post.id,
      );
    } catch (error) {
      this.logger.warn(`No se pudo crear notificacion para post ${post.id}: ${error.message}`);
    }

    return updatedPost;
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    post.deactivate();
    await this.postRepository.update(id, post);
  }

  async getStats(): Promise<{ totalActive: number }> {
    const totalActive = await this.postRepository.countActive();
    return { totalActive };
  }
}
