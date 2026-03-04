/**
 * Servicio de Publicaciones
 *
 * Capa de Aplicación - Casos de uso relacionados con publicaciones de mascotas
 *
 * Gestiona toda la lógica de negocio para publicaciones de mascotas.
 *
 * FASE 2: Implementar
 * - Upload de imágenes a Azure Blob Storage
 * - Paginación de resultados
 *
 * FASE 3: Implementar
 * - Matching automático entre lost/found
 * - Búsqueda geoespacial por coordenadas
 * - Notificaciones de matches
 */

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

  /**
   * Crear una nueva publicación
   */
  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    // Crear value object de ubicación
    const location = new Location(
      createPostDto.location.city,
      createPostDto.location.neighborhood,
      createPostDto.location.address,
      createPostDto.location.coordinates,
    );

    // Crear entidad de dominio
    const post = new Post(
      '', // El ID será generado por el repositorio
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

    // Persistir en el repositorio
    const savedPost = await this.postRepository.create(post);

    // TODO: FASE 3 - Ejecutar matching automático
    // await this.matchingService.findPotentialMatches(savedPost);

    return savedPost;
  }

  /**
   * Obtener todas las publicaciones con filtros opcionales
   */
  async findAll(filters?: FilterPostDto): Promise<Post[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return await this.postRepository.findAll();
    }

    // Mapear FilterPostDto a PostFilters del dominio
    const domainFilters: PostFilters = {
      type: filters.type,
      status: filters.status,
      petType: filters.petType,
      size: filters.size,
      city: filters.city,
    };

    return await this.postRepository.findByFilters(domainFilters);
  }

  /**
   * Obtener una publicación por ID
   */
  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return post;
  }

  /**
   * Obtener publicaciones de un usuario
   */
  async findByUserId(userId: string): Promise<Post[]> {
    return await this.postRepository.findByUserId(userId);
  }

  /**
   * Actualizar publicación
   */
  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar que el usuario sea el dueño de la publicación
    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta publicación');
    }

    // Crear location si fue actualizada
    let location: Location | undefined;
    if (updatePostDto.location) {
      location = new Location(
        updatePostDto.location.city,
        updatePostDto.location.neighborhood,
        updatePostDto.location.address,
        updatePostDto.location.coordinates,
      );
    }

    // Actualizar usando método de la entidad
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

    // Persistir cambios
    return await this.postRepository.update(id, post);
  }

  /**
   * Marcar publicación como resuelta
   */
  async markAsResolved(id: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta publicación');
    }

    // Usar método de la entidad
    post.markAsResolved();

    return await this.postRepository.update(id, post);
  }

  /**
   * Eliminar publicación (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar que el usuario sea el dueño
    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    // Usar método de la entidad
    post.deactivate();

    await this.postRepository.update(id, post);
  }

  /**
   * Obtener estadísticas de publicaciones
   */
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
