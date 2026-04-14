import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { PasswordHashService } from './password-hash.service';
import { RefreshTokenSessionService } from './refresh-token-session.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { User } from '../../domain/entities';
import { UserRole } from '../../domain/enums';

const makeUser = (): User =>
  new User(
    'user-1',
    'test@example.com',
    'testuser',
    'hashed_pass',
    'Juan',
    'Pérez',
    UserRole.USER,
    true,
    new Date(),
    new Date(),
  );

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let passwordHashService: jest.Mocked<Partial<PasswordHashService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let refreshTokenSessionService: jest.Mocked<Partial<RefreshTokenSessionService>>;
  let emailService: jest.Mocked<Partial<EmailService>>;
  let userRepository: { findByEmail: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    passwordHashService = {
      hash: jest.fn().mockResolvedValue('hashed_pass'),
      compare: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
      verify: jest.fn(),
    };
    refreshTokenSessionService = {
      issueTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'mock.jwt.token',
        refreshToken: 'mock.refresh.token',
        tokenType: 'Bearer',
      }),
    };
    emailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendEmailVerification: jest.fn().mockResolvedValue(undefined),
    };
    userRepository = {
      findByEmail: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PasswordHashService, useValue: passwordHashService },
        { provide: JwtService, useValue: jwtService },
        { provide: RefreshTokenSessionService, useValue: refreshTokenSessionService },
        { provide: EmailService, useValue: emailService },
        { provide: 'IUserRepository', useValue: userRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a user and return a token', async () => {
      const dto = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'Pass123!',
        firstName: 'A',
        lastName: 'B',
      };
      const user = makeUser();
      (usersService.create as jest.Mock).mockResolvedValue({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(refreshTokenSessionService.issueTokenPair).toHaveBeenCalledWith(user.id, user.email);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBe('mock.refresh.token');
      expect(result.user.email).toBe(user.email);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = makeUser();
      userRepository.findByEmail.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(user);
      (passwordHashService.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'Pass123!' });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBe('mock.refresh.token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'Pass123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const user = makeUser();
      userRepository.findByEmail.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(user);
      (passwordHashService.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const user = makeUser();
      user.deactivate();
      userRepository.findByEmail.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(user);
      (passwordHashService.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@example.com', password: 'Pass123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
