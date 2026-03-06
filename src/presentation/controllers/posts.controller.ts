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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    const mockUserId = 'current-user-id';
    return this.postsService.create(mockUserId, createPostDto);
  }

  @Get()
  async findAll(@Query() filters: FilterPostDto): Promise<PostEntity[]> {
    return this.postsService.findAll(filters);
  }

  @Get('my-posts')
  async getMyPosts(): Promise<PostEntity[]> {
    const mockUserId = 'current-user-id';
    return this.postsService.findByUserId(mockUserId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const mockUserId = 'current-user-id';
    return this.postsService.update(id, mockUserId, updatePostDto);
  }

  @Put(':id/resolve')
  async markAsResolved(@Param('id') id: string): Promise<PostEntity> {
    const mockUserId = 'current-user-id';
    return this.postsService.markAsResolved(id, mockUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const mockUserId = 'current-user-id';
    return this.postsService.remove(id, mockUserId);
  }
}
