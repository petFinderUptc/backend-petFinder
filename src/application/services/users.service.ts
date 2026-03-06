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
