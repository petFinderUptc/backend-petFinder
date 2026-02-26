/**
 * Servicio de publicaciones
 *
 * Gestiona toda la lógica de negocio para publicaciones de mascotas.
 *
 * FASE 2: Implementar
 * - Conexión real con Cosmos DB
 * - Paginación de resultados
 * - Upload de imágenes a Azure Blob Storage
 *
 * FASE 3: Implementar
 * - Matching automático entre lost/found
 * - Búsqueda geoespacial por coordenadas
 * - Notificaciones de matches
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from './dto/post.dto';
import { IPost, PostStatus } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  // TODO: FASE 2 - Reemplazar con repositorio de Cosmos DB
  private posts: IPost[] = [];

  /**
   * Crear una nueva publicación
   */
  async create(userId: string, createPostDto: CreatePostDto): Promise<IPost> {
    const newPost: IPost = {
      id: this.generateId(),
      userId,
      ...createPostDto,
      status: PostStatus.ACTIVE,
      images: createPostDto.images || [],
      lostOrFoundDate: new Date(createPostDto.lostOrFoundDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.posts.push(newPost);

    // TODO: FASE 3 - Ejecutar matching automático
    // await this.matchingService.findPotentialMatches(newPost);

    return newPost;
  }

  /**
   * Obtener todas las publicaciones con filtros opcionales
   */
  async findAll(filters?: FilterPostDto): Promise<IPost[]> {
    let filteredPosts = this.posts;

    if (filters) {
      if (filters.type) {
        filteredPosts = filteredPosts.filter((post) => post.type === filters.type);
      }
      if (filters.status) {
        filteredPosts = filteredPosts.filter((post) => post.status === filters.status);
      }
      if (filters.petType) {
        filteredPosts = filteredPosts.filter((post) => post.petType === filters.petType);
      }
      if (filters.size) {
        filteredPosts = filteredPosts.filter((post) => post.size === filters.size);
      }
      if (filters.city) {
        filteredPosts = filteredPosts.filter(
          (post) => post.location.city.toLowerCase() === filters.city.toLowerCase(),
        );
      }
      if (filters.neighborhood) {
        filteredPosts = filteredPosts.filter(
          (post) => post.location.neighborhood.toLowerCase() === filters.neighborhood.toLowerCase(),
        );
      }
      if (filters.color) {
        filteredPosts = filteredPosts.filter((post) =>
          post.color.toLowerCase().includes(filters.color.toLowerCase()),
        );
      }
    }

    // TODO: FASE 2 - Implementar paginación
    // TODO: FASE 2 - Ordenar por fecha de creación (más recientes primero)

    return filteredPosts;
  }

  /**
   * Obtener una publicación por ID
   */
  async findOne(id: string): Promise<IPost> {
    const post = this.posts.find((post) => post.id === id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return post;
  }

  /**
   * Obtener publicaciones de un usuario
   */
  async findByUserId(userId: string): Promise<IPost[]> {
    return this.posts.filter((post) => post.userId === userId);
  }

  /**
   * Actualizar publicación
   */
  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<IPost> {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar que el usuario sea el dueño de la publicación
    if (this.posts[postIndex].userId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta publicación');
    }

    this.posts[postIndex] = {
      ...this.posts[postIndex],
      ...updatePostDto,
      updatedAt: new Date(),
    };

    return this.posts[postIndex];
  }

  /**
   * Marcar publicación como resuelta
   */
  async markAsResolved(id: string, userId: string): Promise<IPost> {
    return this.update(id, userId, { status: PostStatus.RESOLVED });
  }

  /**
   * Eliminar publicación (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar que el usuario sea el dueño
    if (this.posts[postIndex].userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    // Soft delete - marcar como inactiva
    this.posts[postIndex].status = PostStatus.INACTIVE;
    this.posts[postIndex].updatedAt = new Date();
  }

  /**
   * Generar ID único temporal
   * TODO: FASE 2 - Cosmos DB generará IDs automáticamente
   */
  private generateId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // TODO: FASE 3 - Implementar métodos de matching
  // async findPotentialMatches(postId: string): Promise<IPost[]>
  // async calculateMatchScore(post1: IPost, post2: IPost): Promise<number>

  // TODO: FASE 2 - Implementar búsqueda geoespacial
  // async findNearby(latitude: number, longitude: number, radiusKm: number): Promise<IPost[]>
}
