export interface ImageDocument {
  id: string;
  userId: string;
  folder: 'posts' | 'avatars' | 'reports';
  containerName: string;
  blobName: string;
  imageUrl: string;
  signedUrl?: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
