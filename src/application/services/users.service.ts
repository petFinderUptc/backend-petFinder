import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserStatsDto } from '../dtos/users';
import { IUserRepository, IReportRepository } from '../../domain/repositories';
import { User } from '../../domain/entities';
import { UserRole, PostStatus } from '../../domain/enums';
import { PasswordHashService } from './password-hash.service';
import { AzureBlobStorageService } from '../../infrastructure/external-services/azure';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
    private readonly passwordHashService: PasswordHashService,
    private readonly azureBlobStorageService: AzureBlobStorageService,
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
      createUserDto.city,
      createUserDto.department,
      createUserDto.bio,
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
      city: updateUserDto.city,
      department: updateUserDto.department,
      bio: updateUserDto.bio,
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

  async updatePasswordHash(userId: string, hashedPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.password = hashedPassword;
    user.updatedAt = new Date();
    await this.userRepository.update(userId, user);
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.verifyEmail();
    await this.userRepository.update(userId, user);
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const reports = await this.reportRepository.findByUserId(userId);
    const resolvedReports = reports.filter((r) => r.status === PostStatus.RESOLVED);

    return {
      reportsPublished: reports.length,
      successfulReunions: resolvedReports.length,
      helpedPets: resolvedReports.length,
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

    await this.azureBlobStorageService.deleteBlobByUrl(user.profileImage);

    const uploadResult = await this.azureBlobStorageService.uploadImage(file, 'avatars', userId);
    user.updateProfile({ profileImage: uploadResult.imageUrl });
    await this.userRepository.update(userId, user);

    return uploadResult.signedUrl || uploadResult.imageUrl;
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.azureBlobStorageService.deleteBlobByUrl(user.profileImage);
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

    const userReports = await this.reportRepository.findByUserId(userId);
    for (const report of userReports) {
      report.deactivate();
      await this.reportRepository.update(report.id, report);
    }

    await this.azureBlobStorageService.deleteBlobByUrl(user.profileImage);
    user.deactivate();
    user.updateProfile({ profileImage: undefined });
    await this.userRepository.update(userId, user);
  }

  private toResponseDto(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      city: user.city,
      department: user.department,
      fullLocation: user.fullLocation,
      bio: user.bio,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
