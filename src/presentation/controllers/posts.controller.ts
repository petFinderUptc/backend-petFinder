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
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from '../../application/services';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from '../../application/dtos/posts';
import { Post as PostEntity } from '../../domain/entities';
import { PetSize, PetType, PostType } from '../../domain/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';
import { AzureBlobStorageService } from '../../infrastructure/external-services/azure';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly azureBlobStorageService: AzureBlobStorageService,
  ) {}

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Solo se permiten imagenes'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @CurrentUser() user: UserFromJwt,
    @UploadedFile() file: any,
  ): Promise<{ imageId: string; imageUrl: string; signedUrl?: string }> {
    if (!file) {
      throw new BadRequestException('Archivo de imagen requerido');
    }

    try {
      const result = await this.azureBlobStorageService.uploadImage(file, 'posts', user.id);
      return {
        imageId: result.imageId,
        imageUrl: result.imageUrl,
        signedUrl: result.signedUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('No fue posible cargar la imagen en este momento');
    }
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

  @Post('multipart')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException('Solo se permiten imagenes jpg, png o webp'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async createMultipart(
    @CurrentUser() user: UserFromJwt,
    @Body() body: any,
    @UploadedFile() file?: any,
  ): Promise<PostEntity> {
    const createPostDto = this.parseMultipartCreatePostDto(body);

    if (file) {
      const upload = await this.azureBlobStorageService.uploadImage(file, 'posts', user.id);
      createPostDto.images = [upload.imageUrl];
    }

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

  private parseMultipartCreatePostDto(body: any): CreatePostDto {
    const location = this.parseLocation(body);

    if (!body?.type || !body?.petType || !body?.color || !body?.size || !body?.description) {
      throw new BadRequestException(
        'Faltan campos requeridos: type, petType, color, size, description',
      );
    }
    if (!body?.contactPhone || !body?.lostOrFoundDate) {
      throw new BadRequestException('Faltan campos requeridos: contactPhone, lostOrFoundDate');
    }

    return {
      type: body.type as PostType,
      petType: body.petType as PetType,
      color: body.color,
      size: body.size as PetSize,
      description: body.description,
      contactPhone: body.contactPhone,
      lostOrFoundDate: body.lostOrFoundDate,
      petName: body.petName,
      breed: body.breed,
      age: body.age !== undefined && body.age !== '' ? Number(body.age) : undefined,
      contactEmail: body.contactEmail,
      location,
      images: this.parseImages(body.images),
    };
  }

  private parseLocation(body: any): CreatePostDto['location'] {
    let parsedLocation: any = body.location;

    if (typeof parsedLocation === 'string') {
      try {
        parsedLocation = JSON.parse(parsedLocation);
      } catch {
        throw new BadRequestException('location debe ser un JSON válido');
      }
    }

    if (!parsedLocation?.city || !parsedLocation?.neighborhood) {
      throw new BadRequestException('location.city y location.neighborhood son requeridos');
    }

    const latRaw = parsedLocation?.coordinates?.latitude;
    const lonRaw = parsedLocation?.coordinates?.longitude;

    const latitude = latRaw !== undefined ? Number(latRaw) : undefined;
    const longitude = lonRaw !== undefined ? Number(lonRaw) : undefined;

    return {
      city: parsedLocation.city,
      neighborhood: parsedLocation.neighborhood,
      address: parsedLocation.address,
      coordinates:
        latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined,
    };
  }

  private parseImages(imagesRaw: any): string[] | undefined {
    if (!imagesRaw) {
      return undefined;
    }

    if (Array.isArray(imagesRaw)) {
      return imagesRaw.map((image) => String(image));
    }

    if (typeof imagesRaw === 'string') {
      try {
        const parsed = JSON.parse(imagesRaw);
        if (Array.isArray(parsed)) {
          return parsed.map((image) => String(image));
        }
      } catch {
        return [imagesRaw];
      }
      return [imagesRaw];
    }

    return undefined;
  }
}
