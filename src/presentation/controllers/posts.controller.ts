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
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from '../../application/services';
import {
  CreatePostDto,
  UpdatePostDto,
  FilterPostDto,
  CreatePetReportDto,
  UpdatePetReportDto,
} from '../../application/dtos/posts';
import { Post as PostEntity } from '../../domain/entities';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('reports')
  async getActiveReports(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<{
    data: PostEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('El parametro page debe ser un entero mayor o igual a 1');
    }

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestException('El parametro limit debe ser un entero entre 1 y 100');
    }

    return this.postsService.findActiveReportsPaginated(parsedPage, parsedLimit);
  }

  @Get('reports/:id')
  async getReportById(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findActiveReportById(id);
  }

  @Put('reports/:id')
  @UseGuards(JwtAuthGuard)
  async updateReport(
    @Param('id') id: string,
    @CurrentUser() user: UserFromJwt,
    @Body() updatePetReportDto: UpdatePetReportDto,
  ): Promise<PostEntity> {
    return this.postsService.updateReport(id, user.id, updatePetReportDto);
  }

  @Delete('reports/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async removeReport(@Param('id') id: string, @CurrentUser() user: UserFromJwt): Promise<void> {
    return this.postsService.removeReport(id, user.id);
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

  @Post('reports')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createReport(
    @CurrentUser() user: UserFromJwt,
    @Body() createPetReportDto: CreatePetReportDto,
  ): Promise<PostEntity> {
    return this.postsService.createReport(user.id, createPetReportDto);
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
