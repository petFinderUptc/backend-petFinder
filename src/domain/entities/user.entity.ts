/**
 * Entidad de Dominio: User
 *
 * Representa un usuario en el sistema con todas sus propiedades y reglas de negocio.
 * Esta es una entidad de dominio pura, independiente de frameworks.
 */

import { UserRole } from '../enums';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public phoneNumber?: string,
    public profileImage?: string,
  ) {
    this.validate();
  }

  /**
   * Validaciones de la entidad
   */
  private validate(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Email inválido');
    }
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new Error('El nombre es requerido');
    }
    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new Error('El apellido es requerido');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtener nombre completo del usuario
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Verificar si el usuario es moderador
   */
  isModerator(): boolean {
    return this.role === UserRole.MODERATOR;
  }

  /**
   * Desactivar usuario
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Activar usuario
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Actualizar perfil
   */
  updateProfile(
    data: Partial<Pick<User, 'firstName' | 'lastName' | 'phoneNumber' | 'profileImage'>>,
  ): void {
    if (data.firstName !== undefined) this.firstName = data.firstName;
    if (data.lastName !== undefined) this.lastName = data.lastName;
    if (data.phoneNumber !== undefined) this.phoneNumber = data.phoneNumber;
    if (data.profileImage !== undefined) this.profileImage = data.profileImage;
    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Convertir a objeto plano (para persistencia)
   */
  toPlainObject() {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      profileImage: this.profileImage,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crear instancia desde objeto plano
   */
  static fromPlainObject(data: any): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.role,
      data.isActive,
      data.createdAt,
      data.updatedAt,
      data.phoneNumber,
      data.profileImage,
    );
  }
}
