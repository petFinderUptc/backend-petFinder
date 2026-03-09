/**
 * Entidad de Dominio: Post
 *
 * Representa una publicación de mascota perdida o encontrada.
 * Contiene toda la lógica de negocio relacionada con publicaciones.
 */

import { PostType, PostStatus, PetType, PetSize } from '../enums';
import { Location } from '../value-objects';

export class Post {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public type: PostType,
    public status: PostStatus,
    public petType: PetType,
    public color: string,
    public size: PetSize,
    public description: string,
    public images: string[],
    public location: Location,
    public contactPhone: string,
    public lostOrFoundDate: Date,
    public createdAt: Date,
    public updatedAt: Date,
    public petName?: string,
    public breed?: string,
    public age?: number,
    public contactEmail?: string,
  ) {
    this.validate();
  }

  /**
   * Validaciones de la entidad
   */
  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('El ID de usuario es requerido');
    }
    if (!this.color || this.color.trim().length === 0) {
      throw new Error('El color es requerido');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('La descripción es requerida');
    }
    if (!this.contactPhone || this.contactPhone.trim().length === 0) {
      throw new Error('El teléfono de contacto es requerido');
    }
    if (this.age !== undefined && this.age < 0) {
      throw new Error('La edad no puede ser negativa');
    }
  }

  /**
   * Verificar si la publicación está activa
   */
  isActive(): boolean {
    return this.status === PostStatus.ACTIVE;
  }

  /**
   * Verificar si es una publicación de mascota perdida
   */
  isLostPet(): boolean {
    return this.type === PostType.LOST;
  }

  /**
   * Verificar si es una publicación de mascota encontrada
   */
  isFoundPet(): boolean {
    return this.type === PostType.FOUND;
  }

  /**
   * Marcar como resuelta (mascota reunida con dueño)
   */
  markAsResolved(): void {
    this.status = PostStatus.RESOLVED;
    this.updatedAt = new Date();
  }

  /**
   * Desactivar publicación
   */
  deactivate(): void {
    this.status = PostStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Reactivar publicación
   */
  reactivate(): void {
    this.status = PostStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Actualizar información de la publicación
   */
  update(data: Partial<Omit<Post, 'id' | 'userId' | 'createdAt'>>): void {
    if (data.type !== undefined) this.type = data.type;
    if (data.status !== undefined) this.status = data.status;
    if (data.petName !== undefined) this.petName = data.petName;
    if (data.petType !== undefined) this.petType = data.petType;
    if (data.breed !== undefined) this.breed = data.breed;
    if (data.color !== undefined) this.color = data.color;
    if (data.size !== undefined) this.size = data.size;
    if (data.age !== undefined) this.age = data.age;
    if (data.description !== undefined) this.description = data.description;
    if (data.images !== undefined) this.images = data.images;
    if (data.location !== undefined) this.location = data.location;
    if (data.contactPhone !== undefined) this.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) this.contactEmail = data.contactEmail;
    if (data.lostOrFoundDate !== undefined) this.lostOrFoundDate = data.lostOrFoundDate;

    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Agregar imagen a la publicación
   */
  addImage(imageUrl: string): void {
    if (!this.images.includes(imageUrl)) {
      this.images.push(imageUrl);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remover imagen de la publicación
   */
  removeImage(imageUrl: string): void {
    const index = this.images.indexOf(imageUrl);
    if (index > -1) {
      this.images.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Convertir a objeto plano (para persistencia)
   */
  toPlainObject() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      status: this.status,
      petName: this.petName,
      petType: this.petType,
      breed: this.breed,
      color: this.color,
      size: this.size,
      age: this.age,
      description: this.description,
      images: this.images,
      location: this.location.toPlainObject(),
      contactPhone: this.contactPhone,
      contactEmail: this.contactEmail,
      lostOrFoundDate: this.lostOrFoundDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crear instancia desde objeto plano
   */
  static fromPlainObject(data: any): Post {
    return new Post(
      data.id,
      data.userId,
      data.type,
      data.status,
      data.petType,
      data.color,
      data.size,
      data.description,
      data.images,
      new Location(
        data.location.city,
        data.location.neighborhood,
        data.location.address,
        data.location.coordinates,
      ),
      data.contactPhone,
      data.lostOrFoundDate,
      data.createdAt,
      data.updatedAt,
      data.petName,
      data.breed,
      data.age,
      data.contactEmail,
    );
  }
}
