/**
 * Controlador de usuarios
 *
 * Maneja las peticiones HTTP relacionadas con usuarios.
 *
 * Endpoints:
 * - GET /users - Listar todos los usuarios (solo admin)
 * - GET /users/:id - Obtener un usuario por ID
 * - GET /users/profile - Obtener perfil del usuario autenticado
 * - PUT /users/profile - Actualizar perfil del usuario autenticado
 * - DELETE /users/:id - Eliminar usuario (solo admin)
 *
 * FASE 2: Agregar guards de autenticación y autorización
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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

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
   * TODO: FASE 2 - Agregar guard @UseGuards(JwtAuthGuard, RolesGuard)
   * TODO: FASE 2 - Agregar decorator @Roles(UserRole.ADMIN)
   */
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  /**
   * Obtener un usuario por ID
   * GET /api/v1/users/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/v1/users/profile
   *
   * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard)
   * TODO: FASE 2 - Usar @CurrentUser() decorator para obtener user desde JWT
   */
  @Get('profile/me')
  async getProfile(): Promise<UserResponseDto> {
    // TODO: Obtener ID del usuario desde el token JWT
    const mockUserId = 'current-user-id';
    return this.usersService.findOne(mockUserId);
  }

  /**
   * Actualizar perfil del usuario autenticado
   * PUT /api/v1/users/profile
   *
   * TODO: FASE 2 - Agregar @UseGuards(JwtAuthGuard)
   */
  @Put('profile/me')
  async updateProfile(@Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // TODO: Obtener ID del usuario desde el token JWT
    const mockUserId = 'current-user-id';
    return this.usersService.update(mockUserId, updateUserDto);
  }

  /**
   * Actualizar cualquier usuario (solo admin)
   * PUT /api/v1/users/:id
   *
   * TODO: FASE 2 - Agregar guards de admin
   */
  @Put(':id')
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
   * TODO: FASE 2 - Agregar guards de admin
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
