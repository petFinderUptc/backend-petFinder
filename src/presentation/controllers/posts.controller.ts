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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { PostsService } from '../../application/services';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from '../../application/dtos/posts';
import { Post as PostEntity } from '../../domain/entities';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Solo se permiten imagenes'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: any): Promise<{ imageUrl: string }> {
    if (!file) {
      throw new BadRequestException('Archivo de imagen requerido');
    }
    const uploadBaseDir = process.env.UPLOAD_DIR || './uploads';
    const postsDir = path.join(process.cwd(), uploadBaseDir, 'posts');
    await fs.mkdir(postsDir, { recursive: true });
    const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const filename = `post-${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`;
    const filePath = path.join(postsDir, filename);
    await fs.writeFile(filePath, file.buffer);
    return { imageUrl: `/uploads/posts/${filename}` };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: UserFromJwt,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.create(user.id, createPostDto);
  }

  @Get()
  async findAll(@Query() filters: FilterPostDto): Promise<PostEntity[]> {
    return this.postsService.findAll(filters);
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@CurrentUser() user: UserFromJwt): Promise<PostEntity[]> {
    return this.postsService.findByUserId(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserFromJwt,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @Put(':id/resolve')
  @UseGuards(JwtAuthGuard)
  async markAsResolved(
    @Param('id') id: string,
    @CurrentUser() user: UserFromJwt,
  ): Promise<PostEntity> {
    return this.postsService.markAsResolved(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: UserFromJwt): Promise<void> {
    return this.postsService.remove(id, user.id);
  }
}