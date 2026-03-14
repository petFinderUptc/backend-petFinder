export interface ReportDocument {
  id: string;
  userId: string;
  species: string; // PetType
  type: string; // PostType (lost | found)
  status: string; // PostStatus (active | inactive | resolved)
  isActive: boolean; // soft-delete flag
  description: string;
  color: string;
  breed: string;
  size: string; // PetSize
  contact: string;
  imageUrl: string;
  lat: number;
  lon: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  embedding: number[]; // reserved for vector search
}
