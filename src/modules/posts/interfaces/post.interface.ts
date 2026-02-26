/**
 * Interface para publicaciones de mascotas
 *
 * Define la estructura de una publicación (perdida o encontrada)
 */

export interface IPost {
  id: string;
  userId: string; // ID del usuario que publica
  type: PostType;
  status: PostStatus;

  // Información de la mascota
  petName?: string;
  petType: PetType;
  breed?: string;
  color: string;
  size: PetSize;
  age?: number;
  description: string;
  images: string[]; // URLs de imágenes en Azure Blob Storage

  // Información de ubicación
  location: {
    city: string;
    neighborhood: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Información de contacto
  contactPhone: string;
  contactEmail?: string;

  // Fechas
  lostOrFoundDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostType {
  LOST = 'lost', // Mascota perdida
  FOUND = 'found', // Mascota encontrada
}

export enum PostStatus {
  ACTIVE = 'active', // Publicación activa
  RESOLVED = 'resolved', // Mascota encontrada/reunida
  INACTIVE = 'inactive', // Publicación desactivada
}

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  OTHER = 'other',
}

export enum PetSize {
  SMALL = 'small', // Pequeño (0-10kg)
  MEDIUM = 'medium', // Mediano (10-25kg)
  LARGE = 'large', // Grande (25kg+)
}
