import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from '../dtos/posts';
import { IPostRepository, PostFilters } from '../../domain/repositories';
import { Post } from '../../domain/entities';
import { PostStatus } from '../../domain/enums';
import { Location } from '../../domain/value-objects';

@Injectable()
export class PostsService {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
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

    return await this.postRepository.update(id, post);
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
    return await this.postRepository.update(id, post);
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

  // TODO: FASE 3 - Implementar métodos de matching
  // async findPotentialMatches(postId: string): Promise<Post[]>
  // async calculateMatchScore(post1: Post, post2: Post): Promise<number>

  // TODO: FASE 2 - Implementar búsqueda geoespacial
  // async findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Post[]>
}
