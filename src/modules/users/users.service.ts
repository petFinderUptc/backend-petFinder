/**
 * Servicio de usuarios
 *
 * Contiene toda la lógica de negocio relacionada con usuarios.
 *
 * Arquitectura:
 * - Controller → Service → Repository → Database
 *
 * En esta fase inicial, los datos están en memoria.
 * FASE 2: Se implementará conexión real con Cosmos DB.
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { IUser, UserRole } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // TODO: FASE 2 - Reemplazar con repositorio real de Cosmos DB
  private users: IUser[] = [];

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar si el email ya existe
    const existingUser = this.users.find((user) => user.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear usuario
    const newUser: IUser = {
      id: this.generateId(),
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    return this.toResponseDto(newUser);
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll(): Promise<UserResponseDto[]> {
    return this.users.map((user) => this.toResponseDto(user));
  }

  /**
   * Buscar usuario por ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.toResponseDto(user);
  }

  /**
   * Buscar usuario por email (usado en autenticación)
   */
  async findByEmail(email: string): Promise<IUser | undefined> {
    return this.users.find((user) => user.email === email);
  }

  /**
   * Actualizar usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    return this.toResponseDto(this.users[userIndex]);
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async remove(id: string): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete - solo marcamos como inactivo
    this.users[userIndex].isActive = false;
    this.users[userIndex].updatedAt = new Date();
  }

  /**
   * Convertir entidad a DTO de respuesta (sin contraseña)
   */
  private toResponseDto(user: IUser): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return new UserResponseDto(userWithoutPassword);
  }

  /**
   * Generar ID único temporal
   * TODO: FASE 2 - Cosmos DB generará IDs automáticamente
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
