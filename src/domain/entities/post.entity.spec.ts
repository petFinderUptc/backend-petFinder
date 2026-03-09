import { Post } from './post.entity';
import { PostType, PostStatus, PetType, PetSize } from '../enums';
import { Location } from '../value-objects/location.vo';

const makeLocation = () => new Location('Tunja', 'Centro', 'Calle 1 #2-3');

const makePost = () =>
  new Post(
    'post-1',
    'user-1',
    PostType.LOST,
    PostStatus.ACTIVE,
    PetType.DOG,
    'café',
    PetSize.MEDIUM,
    'Perro mestizo de color café con collar azul',
    [],
    makeLocation(),
    '+573001234567',
    new Date('2026-03-01'),
    new Date('2026-03-01'),
    new Date('2026-03-01'),
    'Max',
  );

describe('Post Entity', () => {
  describe('constructor & validation', () => {
    it('should create a valid post', () => {
      const post = makePost();
      expect(post.petName).toBe('Max');
      expect(post.type).toBe(PostType.LOST);
      expect(post.status).toBe(PostStatus.ACTIVE);
    });

    it('should throw if userId is empty', () => {
      expect(
        () =>
          new Post(
            '',
            '',
            PostType.LOST,
            PostStatus.ACTIVE,
            PetType.DOG,
            'café',
            PetSize.SMALL,
            'descripción larga',
            [],
            makeLocation(),
            '+573001234567',
            new Date(),
            new Date(),
            new Date(),
          ),
      ).toThrow('El ID de usuario es requerido');
    });

    it('should throw if description is empty', () => {
      expect(
        () =>
          new Post(
            '1',
            'user-1',
            PostType.LOST,
            PostStatus.ACTIVE,
            PetType.DOG,
            'café',
            PetSize.SMALL,
            '',
            [],
            makeLocation(),
            '+573001234567',
            new Date(),
            new Date(),
            new Date(),
          ),
      ).toThrow('La descripción es requerida');
    });

    it('should throw if contactPhone is empty', () => {
      expect(
        () =>
          new Post(
            '1',
            'user-1',
            PostType.LOST,
            PostStatus.ACTIVE,
            PetType.DOG,
            'café',
            PetSize.SMALL,
            'descripción válida',
            [],
            makeLocation(),
            '',
            new Date(),
            new Date(),
            new Date(),
          ),
      ).toThrow('El teléfono de contacto es requerido');
    });

    it('should throw if age is negative', () => {
      expect(
        () =>
          new Post(
            '1',
            'user-1',
            PostType.LOST,
            PostStatus.ACTIVE,
            PetType.DOG,
            'café',
            PetSize.SMALL,
            'descripción válida',
            [],
            makeLocation(),
            '+573001234567',
            new Date(),
            new Date(),
            new Date(),
            'Max',
            undefined,
            -1,
          ),
      ).toThrow('La edad no puede ser negativa');
    });
  });

  describe('type checks', () => {
    it('isLostPet returns true for LOST', () => {
      const post = makePost();
      expect(post.isLostPet()).toBe(true);
      expect(post.isFoundPet()).toBe(false);
    });

    it('isFoundPet returns true for FOUND', () => {
      const post = new Post(
        '1',
        'user-1',
        PostType.FOUND,
        PostStatus.ACTIVE,
        PetType.CAT,
        'negro',
        PetSize.SMALL,
        'descripción larga de gato',
        [],
        makeLocation(),
        '+573001234567',
        new Date(),
        new Date(),
        new Date(),
      );
      expect(post.isFoundPet()).toBe(true);
      expect(post.isLostPet()).toBe(false);
    });
  });

  describe('status transitions', () => {
    it('should mark as resolved', () => {
      const post = makePost();
      post.markAsResolved();
      expect(post.status).toBe(PostStatus.RESOLVED);
      expect(post.isActive()).toBe(false);
    });

    it('should deactivate', () => {
      const post = makePost();
      post.deactivate();
      expect(post.status).toBe(PostStatus.INACTIVE);
    });

    it('should reactivate', () => {
      const post = makePost();
      post.deactivate();
      post.reactivate();
      expect(post.status).toBe(PostStatus.ACTIVE);
      expect(post.isActive()).toBe(true);
    });
  });

  describe('image management', () => {
    it('should add an image', () => {
      const post = makePost();
      post.addImage('https://example.com/img1.jpg');
      expect(post.images).toContain('https://example.com/img1.jpg');
    });

    it('should not add duplicate images', () => {
      const post = makePost();
      post.addImage('https://example.com/img1.jpg');
      post.addImage('https://example.com/img1.jpg');
      expect(post.images.length).toBe(1);
    });

    it('should remove an image', () => {
      const post = makePost();
      post.addImage('https://example.com/img1.jpg');
      post.removeImage('https://example.com/img1.jpg');
      expect(post.images).not.toContain('https://example.com/img1.jpg');
    });
  });

  describe('update', () => {
    it('should update description', () => {
      const post = makePost();
      post.update({ description: 'Nueva descripción del perro perdido' });
      expect(post.description).toBe('Nueva descripción del perro perdido');
    });

    it('should update color', () => {
      const post = makePost();
      post.update({ color: 'negro con blanco' });
      expect(post.color).toBe('negro con blanco');
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const post = makePost();
      const plain = post.toPlainObject();
      const restored = Post.fromPlainObject(plain);
      expect(restored.id).toBe(post.id);
      expect(restored.petName).toBe(post.petName);
      expect(restored.location.city).toBe('Tunja');
    });
  });
});
