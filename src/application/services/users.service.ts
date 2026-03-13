import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserStatsDto } from '../dtos/users';
import { IUserRepository, IPostRepository } from '../../domain/repositories';
import { User } from '../../domain/entities';
import { UserRole, PostStatus } from '../../domain/enums';
import { PasswordHashService } from './password-hash.service';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const existingUsername = await this.userRepository.findByUsername(createUserDto.username);
    if (existingUsername) {
      throw new BadRequestException('El username ya está en uso');
    }

    const hashedPassword = await this.passwordHashService.hash(createUserDto.password);

    const user = new User(
      '',
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

    const savedUser = await this.userRepository.create(user);
    return this.toResponseDto(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.updateProfile({
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      phoneNumber: updateUserDto.phoneNumber,
      profileImage: updateUserDto.profileImage,
    });

    const updatedUser = await this.userRepository.update(id, user);
    return this.toResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.deactivate();
    await this.userRepository.update(id, user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isCurrentPasswordValid = await this.passwordHashService.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contrasena actual es incorrecta');
    }

    const isSamePassword = await this.passwordHashService.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('La nueva contrasena debe ser diferente a la actual');
    }

    user.password = await this.passwordHashService.hash(newPassword);
    user.updatedAt = new Date();
    await this.userRepository.update(userId, user);
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const posts = await this.postRepository.findByUserId(userId);
    const resolvedPosts = posts.filter((post) => post.status === PostStatus.RESOLVED);

    return {
      reportsPublished: posts.length,
      successfulReunions: resolvedPosts.length,
      helpedPets: resolvedPosts.length,
      memberSince: user.createdAt.toISOString(),
    };
  }

  async uploadAvatar(userId: string, file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException('Archivo de avatar requerido');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.deleteLocalAvatarIfExists(user.profileImage);

    const uploadBaseDir = process.env.UPLOAD_DIR || './uploads';
    const avatarDir = path.join(process.cwd(), uploadBaseDir, 'avatars');
    await fs.mkdir(avatarDir, { recursive: true });

    const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const filename = `avatar-${userId}-${Date.now()}${extension}`;
    const filePath = path.join(avatarDir, filename);

    await fs.writeFile(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;
    user.updateProfile({ profileImage: avatarUrl });
    await this.userRepository.update(userId, user);

    return avatarUrl;
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.deleteLocalAvatarIfExists(user.profileImage);
    user.updateProfile({ profileImage: undefined });
    await this.userRepository.update(userId, user);
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await this.passwordHashService.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Contrasena incorrecta');
    }

    const userPosts = await this.postRepository.findByUserId(userId);
    for (const post of userPosts) {
      post.deactivate();
      await this.postRepository.update(post.id, post);
    }

    await this.deleteLocalAvatarIfExists(user.profileImage);
    user.deactivate();
    user.updateProfile({ profileImage: undefined });
    await this.userRepository.update(userId, user);
  }

  private async deleteLocalAvatarIfExists(profileImage?: string): Promise<void> {
    if (!profileImage || !profileImage.startsWith('/uploads/')) {
      return;
    }

    const relativePath = profileImage.replace(/^\//, '').replace(/\//g, path.sep);
    const absolutePath = path.join(process.cwd(), relativePath);

    try {
      await fs.rm(absolutePath, { force: true });
    } catch {
      // Ignorar si el archivo no existe
    }
  }

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
