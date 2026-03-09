import { InMemoryUserRepository } from './in-memory-user.repository';
import { User } from '../../../domain/entities';
import { UserRole } from '../../../domain/enums';

const makeUser = (email = 'test@example.com', username = 'testuser'): User =>
  new User(
    '',
    email,
    username,
    'hashed_pass',
    'Juan',
    'Pérez',
    UserRole.USER,
    true,
    new Date(),
    new Date(),
  );

describe('InMemoryUserRepository', () => {
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });

  describe('create', () => {
    it('should create a user and assign an id', async () => {
      const user = makeUser();
      const created = await repo.create(user);
      expect(created.id).toBeTruthy();
      expect(created.email).toBe('test@example.com');
    });

    it('should store multiple users with unique ids', async () => {
      const u1 = await repo.create(makeUser('a@a.com', 'user1'));
      const u2 = await repo.create(makeUser('b@b.com', 'user2'));
      expect(u1.id).not.toBe(u2.id);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const created = await repo.create(makeUser());
      const found = await repo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.email).toBe('test@example.com');
    });

    it('should return null for nonexistent id', async () => {
      const found = await repo.findById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      await repo.create(makeUser('find@example.com', 'findme'));
      const found = await repo.findByEmail('find@example.com');
      expect(found).not.toBeNull();
    });

    it('should return null for nonexistent email', async () => {
      const found = await repo.findByEmail('ghost@example.com');
      expect(found).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      await repo.create(makeUser('a@a.com', 'myuser'));
      const found = await repo.findByUsername('myuser');
      expect(found?.username).toBe('myuser');
    });

    it('should return null for nonexistent username', async () => {
      const found = await repo.findByUsername('ghost');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all created users', async () => {
      await repo.create(makeUser('a@a.com', 'user1'));
      await repo.create(makeUser('b@b.com', 'user2'));
      const all = await repo.findAll();
      expect(all.length).toBe(2);
    });

    it('should return empty array when no users', async () => {
      const all = await repo.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('existsByEmail / existsByUsername', () => {
    it('should return true if email exists', async () => {
      await repo.create(makeUser('exists@example.com', 'exists'));
      expect(await repo.existsByEmail('exists@example.com')).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      expect(await repo.existsByEmail('no@example.com')).toBe(false);
    });

    it('should return true if username exists', async () => {
      await repo.create(makeUser('x@x.com', 'existsuser'));
      expect(await repo.existsByUsername('existsuser')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a user profile', async () => {
      const created = await repo.create(makeUser());
      await repo.update(created.id, { firstName: 'Carlos' } as Partial<User>);
      const updated = await repo.findById(created.id);
      expect(updated?.firstName).toBe('Carlos');
    });

    it('should throw NotFoundException for nonexistent user', async () => {
      await expect(repo.update('ghost', { firstName: 'X' } as Partial<User>)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const created = await repo.create(makeUser());
      await repo.delete(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundException for nonexistent user', async () => {
      await expect(repo.delete('ghost')).rejects.toThrow();
    });
  });
});
