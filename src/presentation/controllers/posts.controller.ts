/**
 * Controlador de Publicaciones
 *
 * Capa de Presentación - Endpoints HTTP para publicaciones de mascotas
 *
 * Endpoints para gestionar publicaciones de mascotas perdidas/encontradas.
 *
 * Todos los endpoints (excepto GET públicos) requieren autenticación.
 * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard) a endpoints protect protegidos
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from '../../application/services';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from '../../application/dtos/posts';
import { Post as PostEntity } from '../../domain/entities';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Crear una nueva publicación
   * POST /api/v1/posts
   *
   * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard)
   * TODO: FASE 2 - Obtener userId desde token con @CurrentUser()
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    // TODO: Obtener userId real desde JWT
    const mockUserId = 'current-user-id';
    return this.postsService.create(mockUserId, createPostDto);
  }

  /**
   * Obtener todas las publicaciones con filtros opcionales
   * GET /api/v1/posts?type=lost&petType=dog&city=Tunja
   *
   * Endpoint público para búsqueda
   */
  @Get()
  async findAll(@Query() filters: FilterPostDto): Promise<PostEntity[]> {
    return this.postsService.findAll(filters);
  }

  /**
   * Obtener mis publicaciones
   * GET /api/v1/posts/my-posts
   *
   * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard)
   */
  @Get('my-posts')
  async getMyPosts(): Promise<PostEntity[]> {
    // TODO: Obtener userId real desde JWT
    const mockUserId = 'current-user-id';
    return this.postsService.findByUserId(mockUserId);
  }

  /**
   * Obtener una publicación por ID
   * GET /api/v1/posts/:id
   *
   * Endpoint público
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  /**
   * Actualizar publicación
   * PUT /api/v1/posts/:id
   *
   * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard)
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto): Promise<PostEntity> {
    // TODO: Obtener userId real desde JWT
    const mockUserId = 'current-user-id';
    return this.postsService.update(id, mockUserId, updatePostDto);
  }

  /**
   * Marcar publicación como resuelta (mascota encontrada)
   * PUT /api/v1/posts/:id/resolve
   *
   * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard)
   */
  @Put(':id/resolve')
  async markAsResolved(@Param('id') id: string): Promise<PostEntity> {
    // TODO: Obtener userId real desde JWT
    const mockUserId = 'current-user-id';
    return this.postsService.markAsResolved(id, mockUserId);
  }

  /**
   * Eliminar publicación
   * DELETE /api/v1/posts/:id
   *
   * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    // TODO: Obtener userId real desde JWT
    const mockUserId = 'current-user-id';
    return this.postsService.remove(id, mockUserId);
  }

  // TODO: FASE 3 - Agregar endpoints de matching
  // @Get(':id/matches')
  // async findMatches(@Param('id') id: string): Promise<PostEntity[]>

  // TODO: FASE 2 - Agregar endpoint de búsqueda geoespacial
  // @Get('nearby')
  // async findNearby(@Query() location: LocationQueryDto): Promise<PostEntity[]>
}
