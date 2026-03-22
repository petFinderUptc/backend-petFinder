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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
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

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Perfil autenticado',
    description: 'Retorna el perfil del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Perfil del usuario', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@CurrentUser() user: UserFromJwt): Promise<UserResponseDto> {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener usuario por id',
    description: 'Retorna el detalle de un usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No permitido' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserFromJwt,
  ): Promise<UserResponseDto> {
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isAdmin && user.id !== id) {
      throw new ForbiddenException('No tienes permiso para consultar este usuario');
    }
    return this.usersService.findOne(id);
  }

  @Put('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Actualizar perfil',
    description: 'Actualiza los datos del usuario autenticado',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updateProfile(
    @CurrentUser() user: UserFromJwt,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Cambia la contraseña del usuario autenticado',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  @ApiOperation({
    summary: 'Subir avatar',
    description: 'Sube imagen de avatar para el usuario autenticado',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar subido',
    schema: { example: { avatarUrl: 'https://example.com/avatar.png' } },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
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
  @ApiOperation({
    summary: 'Eliminar avatar',
    description: 'Elimina el avatar del usuario autenticado',
  })
  @ApiResponse({ status: 204, description: 'Avatar eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async deleteAvatar(@CurrentUser() user: UserFromJwt): Promise<void> {
    await this.usersService.deleteAvatar(user.id);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar cuenta',
    description: 'Elimina la cuenta del usuario autenticado',
  })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({ status: 204, description: 'Cuenta eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async deleteAccount(
    @CurrentUser() user: UserFromJwt,
    @Body() confirmationDto: DeleteAccountDto,
  ): Promise<void> {
    await this.usersService.deleteAccount(user.id, confirmationDto.password);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza datos de usuario por id (ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
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
  @ApiOperation({ summary: 'Eliminar usuario', description: 'Elimina un usuario por id (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
