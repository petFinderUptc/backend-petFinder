import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../../application/services';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  ChangePasswordDto,
  UserStatsDto,
  DeleteAccountDto,
} from '../../application/dtos/users';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';
import { UserRole } from '../../domain/enums';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario', description: 'Registra un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Retorna todos los usuarios (solo ADMIN)',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Estadísticas de usuario',
    description: 'Retorna estadísticas del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas', type: UserStatsDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getStats(@CurrentUser() user: UserFromJwt): Promise<UserStatsDto> {
    return this.usersService.getUserStats(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserFromJwt): Promise<UserResponseDto> {
    return this.usersService.findOne(user.id);
  }

  @Put('profile/me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: UserFromJwt,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: UserFromJwt,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return { message: 'Contrasena actualizada correctamente' };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Solo se permiten imagenes'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: UserFromJwt,
    @UploadedFile() file: any,
  ): Promise<{ avatarUrl: string }> {
    const avatarUrl = await this.usersService.uploadAvatar(user.id, file);
    return { avatarUrl };
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAvatar(@CurrentUser() user: UserFromJwt): Promise<void> {
    await this.usersService.deleteAvatar(user.id);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @CurrentUser() user: UserFromJwt,
    @Body() confirmationDto: DeleteAccountDto,
  ): Promise<void> {
    await this.usersService.deleteAccount(user.id, confirmationDto.password);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
