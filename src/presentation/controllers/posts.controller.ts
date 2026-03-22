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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from '../../application/services';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from '../../application/dtos/posts';
import { Post as PostEntity } from '../../domain/entities';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@ApiTags('Posts')
@ApiBearerAuth('JWT')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear publicación', description: 'Crear un nuevo post (requiere JWT)' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Publicación creada', type: PostEntity })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @CurrentUser() user: UserFromJwt,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.create(user.id, createPostDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar publicaciones',
    description: 'Retorna publicaciones con filtro opcional',
  })
  @ApiQuery({ name: 'type', required: false, description: 'lost|found', type: String })
  @ApiQuery({ name: 'status', required: false, description: 'Estado del post', type: String })
  @ApiQuery({ name: 'petType', required: false, description: 'Tipo de mascota', type: String })
  @ApiQuery({ name: 'size', required: false, description: 'Tamaño mascota', type: String })
  @ApiQuery({ name: 'city', required: false, description: 'Ciudad', type: String })
  @ApiQuery({ name: 'neighborhood', required: false, description: 'Barrio', type: String })
  @ApiQuery({ name: 'color', required: false, description: 'Color', type: String })
  @ApiResponse({ status: 200, description: 'Lista de publicaciones', type: [PostEntity] })
  async findAll(@Query() filters: FilterPostDto): Promise<PostEntity[]> {
    return this.postsService.findAll(filters);
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mis publicaciones',
    description: 'Publicaciones del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Publicaciones del usuario', type: [PostEntity] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMyPosts(@CurrentUser() user: UserFromJwt): Promise<PostEntity[]> {
    return this.postsService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener publicación',
    description: 'Retorna una publicación por su id',
  })
  @ApiParam({ name: 'id', description: 'ID de la publicación' })
  @ApiResponse({ status: 200, description: 'Publicación encontrada', type: PostEntity })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Actualizar publicación',
    description: 'Actualiza una publicación propia',
  })
  @ApiParam({ name: 'id', description: 'ID de la publicación' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Publicación actualizada', type: PostEntity })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserFromJwt,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @Put(':id/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marcar resuelto', description: 'Marca una publicación como resuelta' })
  @ApiParam({ name: 'id', description: 'ID de la publicación' })
  @ApiResponse({ status: 200, description: 'Publicación resuelta', type: PostEntity })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async markAsResolved(
    @Param('id') id: string,
    @CurrentUser() user: UserFromJwt,
  ): Promise<PostEntity> {
    return this.postsService.markAsResolved(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar publicación', description: 'Elimina una publicación propia' })
  @ApiParam({ name: 'id', description: 'ID de la publicación' })
  @ApiResponse({ status: 204, description: 'Eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserFromJwt): Promise<void> {
    return this.postsService.remove(id, user.id);
  }
}
