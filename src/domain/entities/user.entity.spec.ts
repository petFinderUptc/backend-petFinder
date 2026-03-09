import { User } from './user.entity';
import { UserRole } from '../enums/user-role.enum';

const makeUser = (overrides: Partial<{
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
}> = {}) =>
  new User(
    overrides.id ?? 'user-1',
    overrides.email ?? 'test@example.com',
    overrides.username ?? 'testuser',
    overrides.password ?? 'hashed_password',
    overrides.firstName ?? 'Juan',
    overrides.lastName ?? 'Pérez',
    overrides.role ?? UserRole.USER,
    overrides.isActive ?? true,
    overrides.createdAt ?? new Date('2026-01-01'),
    overrides.updatedAt ?? new Date('2026-01-01'),
  );

describe('User Entity', () => {
  describe('constructor & validation', () => {
    it('should create a valid user', () => {
      const user = makeUser();
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.fullName).toBe('Juan Pérez');
    });

    it('should throw if email is invalid', () => {
      expect(() =>
        new User('1', 'not-an-email', 'user', 'pass', 'A', 'B', UserRole.USER, true, new Date(), new Date()),
      ).toThrow('Email inválido');
    });

    it('should throw if username has invalid characters', () => {
      expect(() =>
        new User('1', 'a@b.com', 'user@#!', 'pass', 'A', 'B', UserRole.USER, true, new Date(), new Date()),
      ).toThrow('Username inválido');
    });

    it('should throw if username is too short', () => {
      expect(() =>
        new User('1', 'a@b.com', 'ab', 'pass', 'A', 'B', UserRole.USER, true, new Date(), new Date()),
      ).toThrow('Username inválido');
    });

    it('should throw if firstName is empty', () => {
      expect(() =>
        new User('1', 'a@b.com', 'validuser', 'pass', '', 'B', UserRole.USER, true, new Date(), new Date()),
      ).toThrow('El nombre es requerido');
    });
  });

  describe('role checks', () => {
    it('should return true for isAdmin when role is ADMIN', () => {
      const user = new User('1', 'a@b.com', 'admin', 'pass', 'A', 'B', UserRole.ADMIN, true, new Date(), new Date());
      expect(user.isAdmin()).toBe(true);
    });

    it('should return false for isAdmin when role is USER', () => {
      const user = makeUser();
      expect(user.isAdmin()).toBe(false);
    });

    it('should return true for isModerator when role is MODERATOR', () => {
      const user = new User('1', 'a@b.com', 'mod', 'pass', 'A', 'B', UserRole.MODERATOR, true, new Date(), new Date());
      expect(user.isModerator()).toBe(true);
    });
  });

  describe('account locking', () => {
    it('should lock account after 5 failed login attempts', () => {
      const user = makeUser();
      for (let i = 0; i < 5; i++) user.recordFailedLoginAttempt();
      expect(user.isAccountLocked()).toBe(true);
      expect(user.failedLoginAttempts).toBe(5);
    });

    it('should not lock account before 5 failed attempts', () => {
      const user = makeUser();
      for (let i = 0; i < 4; i++) user.recordFailedLoginAttempt();
      expect(user.isAccountLocked()).toBe(false);
    });

    it('should reset failed attempts on successful login', () => {
      const user = makeUser();
      user.recordFailedLoginAttempt();
      user.recordFailedLoginAttempt();
      user.recordSuccessfulLogin();
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.isAccountLocked()).toBe(false);
    });
  });

  describe('profile management', () => {
    it('should update profile fields', () => {
      const user = makeUser();
      user.updateProfile({ firstName: 'Carlos', lastName: 'López', city: 'Bogotá' });
      expect(user.firstName).toBe('Carlos');
      expect(user.lastName).toBe('López');
      expect(user.city).toBe('Bogotá');
    });

    it('should compute fullName after update', () => {
      const user = makeUser();
      user.updateProfile({ firstName: 'María', lastName: 'García' });
      expect(user.fullName).toBe('María García');
    });

    it('should compute fullLocation when city and department are set', () => {
      const user = makeUser();
      user.updateProfile({ city: 'Tunja', department: 'Boyacá' });
      expect(user.fullLocation).toBe('Tunja, Boyacá');
    });
  });

  describe('activation/deactivation', () => {
    it('should deactivate a user', () => {
      const user = makeUser();
      user.deactivate();
      expect(user.isActive).toBe(false);
    });

    it('should reactivate a user', () => {
      const user = makeUser();
      user.deactivate();
      user.activate();
      expect(user.isActive).toBe(true);
    });
  });

  describe('email/phone verification', () => {
    it('should verify email', () => {
      const user = makeUser();
      user.verifyEmail();
      expect(user.emailVerified).toBe(true);
    });

    it('should verify phone', () => {
      const user = makeUser();
      user.verifyPhone();
      expect(user.phoneVerified).toBe(true);
    });
  });

  describe('toPlainObject / fromPlainObject', () => {
    it('should serialize and deserialize correctly', () => {
      const user = makeUser();
      const plain = user.toPlainObject();
      const restored = User.fromPlainObject(plain);
      expect(restored.email).toBe(user.email);
      expect(restored.username).toBe(user.username);
      expect(restored.role).toBe(user.role);
    });
  });
});
