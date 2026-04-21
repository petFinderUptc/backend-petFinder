import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities';
import { UserRole } from '../../domain/enums';
import { PasswordHashService } from './password-hash.service';

/**
 * Crea el usuario administrador al iniciar la aplicación si no existe.
 * Las credenciales se leen de variables de entorno:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, ADMIN_FIRST_NAME, ADMIN_LAST_NAME
 */
@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME ?? 'petfinder_admin';
    const firstName = process.env.ADMIN_FIRST_NAME ?? 'Admin';
    const lastName = process.env.ADMIN_LAST_NAME ?? 'PetFinder';

    if (!email || !password) {
      this.logger.warn(
        'ADMIN_EMAIL o ADMIN_PASSWORD no configurados — se omite el seed del admin.',
      );
      return;
    }

    try {
      const existing = await this.userRepository.findByEmail(email);
      if (existing) {
        // Si existe pero no es admin, promoverlo
        if (existing.role !== UserRole.ADMIN) {
          existing.role = UserRole.ADMIN;
          existing.updatedAt = new Date();
          await this.userRepository.update(existing.id, existing);
          this.logger.log(`Usuario ${email} promovido a ADMIN.`);
        } else {
          this.logger.log(`Admin ${email} ya existe — seed omitido.`);
        }
        return;
      }

      const hashedPassword = await this.passwordHashService.hash(password);

      const admin = new User(
        '',
        email,
        username,
        hashedPassword,
        firstName,
        lastName,
        UserRole.ADMIN,
        true,
        new Date(),
        new Date(),
        undefined,
        undefined,
        'Tunja',
        'Boyacá',
        undefined,
        true, // emailVerified
      );

      await this.userRepository.create(admin);
      this.logger.log(`Admin creado: ${email}`);
    } catch (error) {
      this.logger.error(`Error creando admin seed: ${error.message}`);
    }
  }
}
