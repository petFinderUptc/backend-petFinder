/**
 * Servicio de Usuarios
 *
 * Capa de Aplicación - Casos de uso relacionados con usuarios
 *
 * Arquitectura:
 * - Controller → Service (Application) → Repository (Domain) → Database (Infrastructure)
 *
 * Este servicio orquesta la lógica de negocio y utiliza repositorios
 * en lugar de acceso directo a datos.
 */

import { Injectable, NotFoundException, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/users';
import { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities';
import { UserRole } from '../../domain/enums';
import { PasswordHashService } from './password-hash.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.userRepository.findByUsername(createUserDto.username);
    if (existingUsername) {
      throw new BadRequestException('El username ya está en uso');
    }

    // Hash de la contraseña usando el servicio dedicado
    const hashedPassword = await this.passwordHashService.hash(createUserDto.password);

    // Crear entidad de dominio
    const user = new User(
      '', // El ID será generado por el repositorio
      createUserDto.email,
      createUserDto.username,
      hashedPassword,
      createUserDto.firstName,
      createUserDto.lastName,
      UserRole.USER,
      true,
      new Date(),
      new Date(),
      createUserDto.phoneNumber,
      createUserDto.profileImage,
    );

    // Persistir en el repositorio
    const savedUser = await this.userRepository.create(user);

    return this.toResponseDto(savedUser);
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toResponseDto(user));
  }

  /**
   * Buscar usuario por ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.toResponseDto(user);
  }

  /**
   * Buscar usuario por email (usado en autenticación)
   * Retorna el usuario completo con contraseña (solo para auth)
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Actualizar usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar usando método de la entidad
    user.updateProfile({
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      phoneNumber: updateUserDto.phoneNumber,
      profileImage: updateUserDto.profileImage,
    });

    // Persistir cambios
    const updatedUser = await this.userRepository.update(id, user);

    return this.toResponseDto(updatedUser);
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Desactivar usando método de la entidad
    user.deactivate();

    // Persistir cambios
    await this.userRepository.update(id, user);
  }

  /**
   * Convertir entidad a DTO de respuesta (sin contraseña)
   */
  private toResponseDto(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
