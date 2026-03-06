/**
 * Controlador de Usuarios
 *
 * Capa de Presentación - Endpoints HTTP para gestión de usuarios
 *
 * Endpoints protegidos:
 * - GET /users - Listar todos los usuarios (SOLO ADMIN) ✅
 * - GET /users/profile/me - Obtener perfil del usuario autenticado ✅
 * - PUT /users/profile/me - Actualizar perfil del usuario autenticado ✅
 * - PUT /users/:id - Actualizar cualquier usuario (SOLO ADMIN) ✅
 * - DELETE /users/:id - Eliminar usuario (SO ADMIN) ✅
 *
 * Endpoints públicos:
 * - GET /users/:id - Obtener un usuario por ID (público para ver perfiles)
 */

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
} from '@nestjs/common';
import { UsersService } from '../../application/services';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../application/dtos/users';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';
import { UserRole } from '../../domain/enums';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crear un nuevo usuario
   * POST /api/v1/users
   *
   * Nota: En producción, esto debería estar protegido o ser parte del registro
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  /**
   * Obtener todos los usuarios
   * GET /api/v1/users
   * 
   * Protección: Solo usuarios con rol ADMIN
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  /**
   * Obtener un usuario por ID
   * GET /api/v1/users/:id
   * 
   * Endpoint público (para ver perfiles de otros usuarios)
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/v1/users/profile/me
   * 
   * Protección: Requiere autenticación (cualquier usuario)
   * Extrae el usuario desde el token JWT
   */
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserFromJwt): Promise<UserResponseDto> {
    // El decorador @CurrentUser() extrae el usuario desde request.user
    return this.usersService.findOne(user.id);
  }

  /**
   * Actualizar perfil del usuario autenticado
   * PUT /api/v1/users/profile/me
   * 
   * Protección: Requiere autenticación (cualquier usuario)
   * Solo puede actualizar su propio perfil
   */
  @Put('profile/me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: UserFromJwt,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // El decorador @CurrentUser() extrae el usuario desde request.user
    return this.usersService.update(user.id, updateUserDto);
  }

  /**
   * Actualizar cualquier usuario (solo admin)
   * PUT /api/v1/users/:id
   * 
   * Protección: Solo usuarios con rol ADMIN
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Eliminar usuario (soft delete)
   * DELETE /api/v1/users/:id
   * 
   * Protección: Solo usuarios con rol ADMIN
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
