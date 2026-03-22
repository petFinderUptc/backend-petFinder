import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PasswordHashService } from './password-hash.service';
import { IUserRepository, IPostRepository } from '../../domain/repositories';
import { User } from '../../domain/entities';
import { UserRole } from '../../domain/enums';
import { AzureBlobStorageService } from '../../infrastructure/external-services/azure';

const makeUser = (
  overrides: Partial<{
    id: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): User =>
  new User(
    overrides.id ?? 'user-1',
    overrides.email ?? 'test@example.com',
    overrides.username ?? 'testuser',
    overrides.password ?? 'hashed_pass',
    overrides.firstName ?? 'Juan',
    overrides.lastName ?? 'Pérez',
    overrides.role ?? UserRole.USER,
    overrides.isActive ?? true,
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );

const mockUserRepository = (): jest.Mocked<IUserRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUsername: jest.fn(),
});

const mockPasswordHashService = () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
  isHashValid: jest.fn().mockReturnValue(true),
  getSaltRounds: jest.fn().mockReturnValue(12),
  needsRehash: jest.fn().mockReturnValue(false),
});

const mockPostRepository = (): jest.Mocked<IPostRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByFilters: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countActive: jest.fn(),
});

const mockAzureBlobStorageService = () => ({
  uploadImage: jest.fn().mockResolvedValue({
    imageUrl: 'https://storage.blob.core.windows.net/pet-images/avatars/test.jpg',
    signedUrl: 'https://storage.blob.core.windows.net/pet-images/avatars/test.jpg?sig=dummy',
    blobName: 'avatars/test.jpg',
  }),
  deleteBlobByUrl: jest.fn().mockResolvedValue(undefined),
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<IUserRepository>;
  let postRepo: jest.Mocked<IPostRepository>;
  let passwordHash: ReturnType<typeof mockPasswordHashService>;
  let azureBlobStorage: ReturnType<typeof mockAzureBlobStorageService>;

  beforeEach(async () => {
    repo = mockUserRepository();
    postRepo = mockPostRepository();
    passwordHash = mockPasswordHashService();
    azureBlobStorage = mockAzureBlobStorageService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'IUserRepository', useValue: repo },
        { provide: 'IPostRepository', useValue: postRepo },
        { provide: PasswordHashService, useValue: passwordHash },
        { provide: AzureBlobStorageService, useValue: azureBlobStorage },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const dto = {
      email: 'nuevo@example.com',
      username: 'nuevo',
      password: 'Password123!',
      firstName: 'Nuevo',
      lastName: 'Usuario',
    };

    it('should create a user successfully', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(null);
      const savedUser = new User(
        'user-2',
        dto.email,
        dto.username,
        'hashed_password',
        dto.firstName,
        dto.lastName,
        UserRole.USER,
        true,
        new Date(),
        new Date(),
      );
      repo.create.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(repo.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(repo.findByUsername).toHaveBeenCalledWith(dto.username);
      expect(passwordHash.hash).toHaveBeenCalledWith(dto.password);
      expect(repo.create).toHaveBeenCalled();
      expect(result.email).toBe(dto.email);
    });

    it('should throw BadRequestException if email already exists', async () => {
      repo.findByEmail.mockResolvedValue(makeUser());
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('El email ya está registrado');
    });

    it('should throw BadRequestException if username already exists', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUsername.mockResolvedValue(makeUser());
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('El username ya está en uso');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = makeUser();
      repo.findById.mockResolvedValue(user);
      const result = await service.findOne('user-1');
      expect(result.id).toBe('user-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users as DTOs', async () => {
      const users = [makeUser(), makeUser()];
      repo.findAll.mockResolvedValue(users);
      const result = await service.findAll();
      expect(result.length).toBe(2);
    });

    it('should return empty array when no users', async () => {
      repo.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const user = makeUser();
      repo.findById.mockResolvedValue(user);
      repo.update.mockResolvedValue(user);
      const result = await service.update('user-1', { firstName: 'Carlos' });
      expect(repo.update).toHaveBeenCalledWith('user-1', user);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when updating nonexistent user', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('ghost', { firstName: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should deactivate the user', async () => {
      const user = makeUser();
      repo.findById.mockResolvedValue(user);
      repo.update.mockResolvedValue(user);
      await service.remove('user-1');
      expect(user.isActive).toBe(false);
      expect(repo.update).toHaveBeenCalledWith('user-1', user);
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
