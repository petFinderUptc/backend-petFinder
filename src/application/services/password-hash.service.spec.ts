import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PasswordHashService } from './password-hash.service';
import * as bcrypt from 'bcrypt';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordHashService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(10) },
        },
      ],
    }).compile();

    service = module.get<PasswordHashService>(PasswordHashService);
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const hash = await service.hash('MyPassword123');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('MyPassword123');
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('should produce different hashes for the same password (unique salts)', async () => {
      const hash1 = await service.hash('MyPassword123');
      const hash2 = await service.hash('MyPassword123');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const password = 'MyPassword123';
      const hash = await service.hash(password);
      const result = await service.compare(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await service.hash('MyPassword123');
      const result = await service.compare('WrongPassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('isHashValid', () => {
    it('should return true for a valid bcrypt hash', async () => {
      const hash = await service.hash('test');
      expect(service.isHashValid(hash)).toBe(true);
    });

    it('should return false for a plain text string', () => {
      expect(service.isHashValid('plaintext')).toBe(false);
    });

    it('should return false for an empty string', () => {
      expect(service.isHashValid('')).toBe(false);
    });
  });

  describe('getSaltRounds', () => {
    it('should return the configured salt rounds', () => {
      expect(service.getSaltRounds()).toBe(10);
    });
  });

  describe('needsRehash', () => {
    it('should return true if hash uses fewer rounds than configured', async () => {
      // hash with 8 rounds, service configured with 10
      const weakHash = await bcrypt.hash('test', 8);
      expect(service.needsRehash(weakHash)).toBe(true);
    });

    it('should return false if hash uses same rounds as configured', async () => {
      const hash = await service.hash('test'); // uses 10 rounds
      expect(service.needsRehash(hash)).toBe(false);
    });
  });
});
