export interface AuthSessionDocument {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
  updatedAt: string;
  revokedAt?: string;
}
