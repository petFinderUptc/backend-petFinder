/**
 * Implementación In-Memory del UserRepository
 *
 * Capa de Infraestructura - Implementación concreta del repositorio
 * Esta implementación almacena datos en memoria (temporal para desarrollo)
 *
 * FASE 2: Crear implementación con Cosmos DB
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories';
import { User } from '../../../domain/entities';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private idCounter = 1;

  async create(user: User): Promise<User> {
    const newUser = new User(
      this.generateId(),
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.role,
      user.isActive,
      new Date(),
      new Date(),
      user.phoneNumber,
      user.profileImage,
    );

    this.users.push(newUser);
    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const user = this.users[userIndex];
    user.updateProfile({
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      profileImage: userData.profileImage,
    });

    return user;
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }
    this.users.splice(userIndex, 1);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.users.some((u) => u.email === email);
  }

  private generateId(): string {
    return `user_${this.idCounter++}_${Date.now()}`;
  }
}
