import { Injectable, NotFoundException } from '@nestjs/common';
import { IPostRepository, PostFilters } from '../../../domain/repositories';
import { Post } from '../../../domain/entities';
import { PostStatus } from '../../../domain/enums';

@Injectable()
export class InMemoryPostRepository implements IPostRepository {
  private posts: Post[] = [];
  private idCounter = 1;

  async create(post: Post): Promise<Post> {
    const newPost = Post.fromPlainObject({
      ...post.toPlainObject(),
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.posts.push(newPost);
    return newPost;
  }

  async findById(id: string): Promise<Post | null> {
    const post = this.posts.find((p) => p.id === id);
    return post || null;
  }

  async findAll(): Promise<Post[]> {
    return [...this.posts];
  }

  async findByFilters(filters: PostFilters): Promise<Post[]> {
    return this.posts.filter((post) => {
      if (filters.type && post.type !== filters.type) return false;
      if (filters.status && post.status !== filters.status) return false;
      if (filters.petType && post.petType !== filters.petType) return false;
      if (filters.size && post.size !== filters.size) return false;
      if (filters.city && post.location.city !== filters.city) return false;
      if (filters.userId && post.userId !== filters.userId) return false;
      return true;
    });
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.posts.filter((p) => p.userId === userId);
  }

  async update(id: string, postData: Partial<Post>): Promise<Post> {
    const post = await this.findById(id);
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    post.update(postData);
    return post;
  }

  async delete(id: string): Promise<void> {
    const postIndex = this.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      throw new NotFoundException('Publicación no encontrada');
    }
    this.posts.splice(postIndex, 1);
  }

  async countActive(): Promise<number> {
    return this.posts.filter((p) => p.status === PostStatus.ACTIVE).length;
  }

  private generateId(): string {
    return `post_${this.idCounter++}_${Date.now()}`;
  }
}
