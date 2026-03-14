import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  CreatePostDto,
  UpdatePostDto,
  FilterPostDto,
  CreatePetReportDto,
  UpdatePetReportDto,
} from '../dtos/posts';
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
    return savedPost;
  }

  async createReport(userId: string, createPetReportDto: CreatePetReportDto): Promise<Post> {
    this.validateBlobImageUrl(createPetReportDto.imageUrl);

    const location = new Location('N/A', 'N/A', undefined, {
      latitude: createPetReportDto.lat,
      longitude: createPetReportDto.lon,
    });

    const status = createPetReportDto.status;
    const post = new Post(
      '',
      userId,
      createPetReportDto.type,
      status,
      createPetReportDto.species,
      createPetReportDto.color,
      createPetReportDto.size,
      createPetReportDto.description,
      [createPetReportDto.imageUrl],
      location,
      createPetReportDto.contact,
      new Date(),
      new Date(),
      new Date(),
      undefined,
      createPetReportDto.breed,
      undefined,
      undefined,
    );

    return this.postRepository.create(post);
  }

  async updateReport(
    id: string,
    userId: string,
    updatePetReportDto: UpdatePetReportDto,
  ): Promise<Post> {
    const report = await this.postRepository.findById(id);
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (report.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este reporte');
    }

    if (updatePetReportDto.imageUrl) {
      this.validateBlobImageUrl(updatePetReportDto.imageUrl);
    }

    const hasGeoUpdate =
      updatePetReportDto.lat !== undefined || updatePetReportDto.lon !== undefined;

    const location = hasGeoUpdate
      ? new Location(report.location.city, report.location.neighborhood, report.location.address, {
          latitude: updatePetReportDto.lat ?? report.location.coordinates?.latitude ?? 0,
          longitude: updatePetReportDto.lon ?? report.location.coordinates?.longitude ?? 0,
        })
      : undefined;

    const images = updatePetReportDto.imageUrl
      ? [
          updatePetReportDto.imageUrl,
          ...report.images.filter((existingUrl) => existingUrl !== updatePetReportDto.imageUrl),
        ]
      : undefined;

    report.update({
      status: updatePetReportDto.status,
      petType: updatePetReportDto.species,
      breed: updatePetReportDto.breed,
      color: updatePetReportDto.color,
      size: updatePetReportDto.size,
      description: updatePetReportDto.description,
      images,
      location,
      contactPhone: updatePetReportDto.contact,
    });

    const updated = await this.postRepository.update(id, report);

    try {
      await this.notificationsService.create(
        report.userId,
        NotificationType.UPDATE,
        'Reporte actualizado',
        `Tu reporte ${report.id} fue editado correctamente.`,
        report.id,
      );
    } catch (error) {
      this.logger.warn(`No se pudo crear notificacion para post ${report.id}: ${error.message}`);
    }

    return updated;
  }

  async removeReport(id: string, userId: string): Promise<void> {
    const report = await this.postRepository.findById(id);
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (report.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este reporte');
    }

    report.deactivate();
    await this.postRepository.update(id, report);
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

  async findActiveReportsPaginated(
    page: number,
    limit: number,
  ): Promise<{
    data: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const allPosts = await this.postRepository.findAll();

    const activeReports = allPosts
      .filter((post) => post.isActive())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = activeReports.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const data = activeReports.slice(offset, offset + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findActiveReportById(id: string): Promise<Post> {
    const report = await this.postRepository.findById(id);

    if (!report || !report.isActive()) {
      throw new NotFoundException('Reporte no encontrado');
    }

    return report;
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

  private validateBlobImageUrl(imageUrl: string): void {
    try {
      const url = new URL(imageUrl);
      const isAzureBlob = url.hostname.includes('blob.core.windows.net');
      if (!isAzureBlob) {
        throw new BadRequestException('imageUrl debe apuntar a Azure Blob Storage');
      }
    } catch {
      throw new BadRequestException('imageUrl invalida');
    }
  }

  // TODO: FASE 3 - Implementar métodos de matching
  // async findPotentialMatches(postId: string): Promise<Post[]>
  // async calculateMatchScore(post1: Post, post2: Post): Promise<number>

  // TODO: FASE 2 - Implementar búsqueda geoespacial
  // async findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Post[]>
}
