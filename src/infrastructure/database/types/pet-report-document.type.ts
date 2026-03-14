/**
 * Documento PetReport para persistencia en Cosmos DB.
 *
 * Este modelo define la estructura esperada por frontend para reportes de mascotas
 * y se almacena junto con el resto de campos del dominio Post.
 */
export interface PetReportDocument {
  /** Identificador único del reporte (obligatorio) */
  id: string;

  /** Identificador del usuario dueño del reporte (obligatorio) */
  userId: string;

  /** Especie de la mascota (obligatorio) */
  species: string;

  /** Estado del reporte (obligatorio) */
  status: string;

  /** Indica si el reporte sigue activo (obligatorio para eliminacion logica) */
  isActive: boolean;

  /** Descripción del reporte (obligatorio) */
  description: string;

  /** Color principal de la mascota (obligatorio) */
  color: string;

  /** Raza de la mascota (obligatorio por contrato de persistencia) */
  breed: string;

  /** Tamaño de la mascota (obligatorio) */
  size: string;

  /** Contacto principal del reporte (obligatorio) */
  contact: string;

  /** URL principal de imagen (obligatorio por contrato de persistencia) */
  imageUrl: string;

  /** Latitud geográfica (obligatorio) */
  lat: number;

  /** Longitud geográfica (obligatorio) */
  lon: number;

  /** Fecha de creación en formato ISO 8601 (obligatorio) */
  createdAt: string;

  /** Campo reservado para embeddings vectoriales (inicialmente vacío) */
  embedding: number[];

  // Campos existentes de la entidad Post para compatibilidad interna
  type?: string;
  petName?: string;
  petType?: string;
  age?: number;
  images?: string[];
  location?: {
    city: string;
    neighborhood: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactPhone?: string;
  contactEmail?: string;
  lostOrFoundDate?: string;
  updatedAt?: string;
}
