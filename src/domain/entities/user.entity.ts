import { UserRole } from '../enums';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public username: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public phoneNumber?: string,
    public profileImage?: string,
    public city?: string,
    public department?: string, // Departamento de Colombia
    public bio?: string,
    public emailVerified?: boolean,
    public phoneVerified?: boolean,
    public lastLogin?: Date,
    public failedLoginAttempts?: number,
    public accountLockedUntil?: Date,
    public notificationsEnabled?: boolean,
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
    if (!this.username || !this.isValidUsername(this.username)) {
      throw new Error(
        'Username inválido: debe tener entre 3-20 caracteres alfanuméricos, guiones o guiones bajos',
      );
    }
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new Error('El nombre es requerido');
    }
    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new Error('El apellido es requerido');
    }
    if (this.bio && this.bio.length > 500) {
      throw new Error('La biografía no puede exceder 500 caracteres');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUsername(username: string): boolean {
    // Solo letras, números, guiones y guiones bajos, entre 3 y 20 caracteres
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Obtener nombre completo del usuario
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Obtener ubicación completa
   */
  get fullLocation(): string | null {
    if (this.city && this.department) {
      return `${this.city}, ${this.department}`;
    }
    return this.city || this.department || null;
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
   * Verificar si la cuenta está bloqueada
   */
  isAccountLocked(): boolean {
    if (!this.accountLockedUntil) return false;
    return this.accountLockedUntil > new Date();
  }

  /**
   * Registrar intento de login fallido
   */
  recordFailedLoginAttempt(): void {
    this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;

    // Bloquear cuenta después de 5 intentos fallidos
    if (this.failedLoginAttempts >= 5) {
      const lockDuration = 30 * 60 * 1000; // 30 minutos
      this.accountLockedUntil = new Date(Date.now() + lockDuration);
    }

    this.updatedAt = new Date();
  }

  /**
   * Registrar login exitoso
   */
  recordSuccessfulLogin(): void {
    this.lastLogin = new Date();
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Verificar email
   */
  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  /**
   * Verificar teléfono
   */
  verifyPhone(): void {
    this.phoneVerified = true;
    this.updatedAt = new Date();
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
    data: Partial<
      Pick<
        User,
        'firstName' | 'lastName' | 'phoneNumber' | 'profileImage' | 'city' | 'department' | 'bio'
      >
    >,
  ): void {
    if (data.firstName !== undefined) this.firstName = data.firstName;
    if (data.lastName !== undefined) this.lastName = data.lastName;
    if (data.phoneNumber !== undefined) this.phoneNumber = data.phoneNumber;
    if (data.profileImage !== undefined) this.profileImage = data.profileImage;
    if (data.city !== undefined) this.city = data.city;
    if (data.department !== undefined) this.department = data.department;
    if (data.bio !== undefined) this.bio = data.bio;
    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Cambiar username (requiere verificación de disponibilidad)
   */
  changeUsername(newUsername: string): void {
    this.username = newUsername;
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
      username: this.username,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      profileImage: this.profileImage,
      city: this.city,
      department: this.department,
      bio: this.bio,
      role: this.role,
      isActive: this.isActive,
      emailVerified: this.emailVerified || false,
      phoneVerified: this.phoneVerified || false,
      lastLogin: this.lastLogin,
      failedLoginAttempts: this.failedLoginAttempts || 0,
      accountLockedUntil: this.accountLockedUntil,
      notificationsEnabled: this.notificationsEnabled ?? true,
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
      data.username,
      data.password,
      data.firstName,
      data.lastName,
      data.role,
      data.isActive,
      data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
      data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
      data.phoneNumber,
      data.profileImage,
      data.city,
      data.department,
      data.bio,
      data.emailVerified,
      data.phoneVerified,
      data.lastLogin
        ? data.lastLogin instanceof Date
          ? data.lastLogin
          : new Date(data.lastLogin)
        : undefined,
      data.failedLoginAttempts,
      data.accountLockedUntil
        ? data.accountLockedUntil instanceof Date
          ? data.accountLockedUntil
          : new Date(data.accountLockedUntil)
        : undefined,
      data.notificationsEnabled ?? true,
    );
  }
}
