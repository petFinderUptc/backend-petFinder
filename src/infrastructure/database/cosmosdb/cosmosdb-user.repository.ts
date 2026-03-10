/**
 * Repositorio de Usuarios con Azure Cosmos DB
 *
 * Implementa IUserRepository usando Cosmos DB como almacenamiento.
 * Maneja el mapeo entre entidades de dominio y documentos de Cosmos DB.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Container } from '@azure/cosmos';
import { IUserRepository } from '../../../domain/repositories';
import { User } from '../../../domain/entities';
import { UserRole } from '../../../domain/enums';
import { CosmosDbService } from '../cosmosdb.service';
import { UserDocument } from '../types/user-document.type';

@Injectable()
export class CosmosDbUserRepository implements IUserRepository {
  private readonly logger = new Logger(CosmosDbUserRepository.name);

  constructor(private cosmosDbService: CosmosDbService) {}

  private getContainer(): Container {
    return this.cosmosDbService.getUsersContainer();
  }

  async create(user: User): Promise<User> {
    try {
      const document = this.toDocument(user);
      const { resource } = await this.getContainer().items.create(document);

      this.logger.log(`User created in Cosmos DB: ${user.id}`);
      return this.toDomain(resource);
    } catch (error) {
      this.logger.error(`Error creating user in Cosmos DB: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const { resources } = await this.getContainer()
        .items.query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id }],
        })
        .fetchAll();

      if (resources.length === 0) {
        return null;
      }

      return this.toDomain(resources[0]);
    } catch (error) {
      this.logger.error(`Error finding user by id ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      // Email es el partition key, query optimizada
      const { resources } = await this.getContainer()
        .items.query({
          query: 'SELECT * FROM c WHERE c.email = @email',
          parameters: [{ name: '@email', value: email }],
        })
        .fetchAll();

      if (resources.length === 0) {
        return null;
      }

      return this.toDomain(resources[0]);
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}: ${error.message}`);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const { resources } = await this.getContainer()
        .items.query({
          query: 'SELECT * FROM c WHERE c.username = @username',
          parameters: [{ name: '@username', value: username }],
        })
        .fetchAll();

      if (resources.length === 0) {
        return null;
      }

      return this.toDomain(resources[0]);
    } catch (error) {
      this.logger.error(`Error finding user by username ${username}: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const { resources } = await this.getContainer().items.query('SELECT * FROM c').fetchAll();

      return resources.map((doc) => this.toDomain(doc));
    } catch (error) {
      this.logger.error(`Error finding all users: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      // Primero obtener el usuario existente para conocer su partition key (email)
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error(`User with id ${id} not found`);
      }

      // Aplicar actualizaciones creando una nueva instancia
      const updatedUser = new User(
        existingUser.id,
        updates.email ?? existingUser.email,
        updates.username ?? existingUser.username,
        updates.password ?? existingUser.password,
        updates.firstName ?? existingUser.firstName,
        updates.lastName ?? existingUser.lastName,
        updates.role ?? existingUser.role,
        updates.isActive ?? existingUser.isActive,
        existingUser.createdAt,
        new Date(), // updatedAt se actualiza ahora
        updates.phoneNumber ?? existingUser.phoneNumber,
        updates.profileImage ?? existingUser.profileImage,
        updates.city ?? existingUser.city,
        updates.department ?? existingUser.department,
        updates.bio ?? existingUser.bio,
        updates.emailVerified ?? existingUser.emailVerified,
        updates.phoneVerified ?? existingUser.phoneVerified,
        updates.lastLogin ?? existingUser.lastLogin,
        updates.failedLoginAttempts ?? existingUser.failedLoginAttempts,
        updates.accountLockedUntil ?? existingUser.accountLockedUntil,
      );
      const document = this.toDocument(updatedUser);

      // Reemplazar documento usando email como partition key
      const { resource } = await this.getContainer().item(id, existingUser.email).replace(document);

      this.logger.log(`User updated in Cosmos DB: ${id}`);
      return this.toDomain(resource);
    } catch (error) {
      this.logger.error(`Error updating user ${id}: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Primero obtener el usuario para conocer su partition key
      const user = await this.findById(id);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }

      await this.getContainer().item(id, user.email).delete();
      this.logger.log(`User deleted from Cosmos DB: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting user ${id}: ${error.message}`);
      throw error;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const { resources } = await this.getContainer()
        .items.query({
          query: 'SELECT VALUE COUNT(1) FROM c WHERE c.email = @email',
          parameters: [{ name: '@email', value: email }],
        })
        .fetchAll();

      return resources[0] > 0;
    } catch (error) {
      this.logger.error(`Error checking email existence: ${error.message}`);
      throw error;
    }
  }

  async existsByUsername(username: string): Promise<boolean> {
    try {
      const { resources } = await this.getContainer()
        .items.query({
          query: 'SELECT VALUE COUNT(1) FROM c WHERE c.username = @username',
          parameters: [{ name: '@username', value: username }],
        })
        .fetchAll();

      return resources[0] > 0;
    } catch (error) {
      this.logger.error(`Error checking username existence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convierte una entidad de dominio User a un documento de Cosmos DB
   */
  private toDocument(user: User): UserDocument {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      city: user.city,
      department: user.department,
      bio: user.bio,
      emailVerified: user.emailVerified ?? false,
      phoneVerified: user.phoneVerified ?? false,
      lastLogin: user.lastLogin?.toISOString(),
      failedLoginAttempts: user.failedLoginAttempts ?? 0,
      accountLockedUntil: user.accountLockedUntil?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Convierte un documento de Cosmos DB a una entidad de dominio User
   */
  private toDomain(doc: UserDocument): User {
    return new User(
      doc.id,
      doc.email,
      doc.username,
      doc.password,
      doc.firstName,
      doc.lastName,
      doc.role as UserRole,
      doc.isActive,
      new Date(doc.createdAt),
      new Date(doc.updatedAt),
      doc.phoneNumber,
      doc.profileImage,
      doc.city,
      doc.department,
      doc.bio,
      doc.emailVerified,
      doc.phoneVerified,
      doc.lastLogin ? new Date(doc.lastLogin) : undefined,
      doc.failedLoginAttempts,
      doc.accountLockedUntil ? new Date(doc.accountLockedUntil) : undefined,
    );
  }
}
