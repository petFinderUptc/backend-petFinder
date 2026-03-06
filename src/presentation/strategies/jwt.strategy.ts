/**
 * JWT Strategy
 *
 * Esta estrategia se encarga de validar tokens JWT en requests protegidos.
 * Passport usa esta estrategia automáticamente cuando se usa JwtAuthGuard.
 *
 * Flujo:
 * 1. Extrae el token JWT del header Authorization (Bearer token)
 * 2. Verifica que el token sea válido (firma y expiración)
 * 3. Extrae el payload (sub, email, etc.)
 * 4. Valida que el usuario aún exista en la base de datos
 * 5. Inyecta el usuario completo en request.user
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../application/services';

/**
 * Interfaz para el payload del JWT
 */
export interface JwtPayload {
  sub: string;  // User ID
  email: string;
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration (timestamp)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Extraer JWT del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // No ignorar tokens expirados (rechazarlos automáticamente)
      ignoreExpiration: false,
      
      // Secret usado para verificar la firma del token
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * Método validate - llamado automáticamente por Passport
   * 
   * Si este método no lanza una excepción, el usuario es válido
   * y lo que retorne se inyecta en request.user
   * 
   * @param payload - Payload del JWT decodificado
   * @returns Usuario completo que se inyectará en request.user
   */
  async validate(payload: JwtPayload) {
    // Buscar usuario por ID (payload.sub contiene el User ID)
    const user = await this.usersService.findByEmail(payload.email);
    
    if (!user) {
      // Usuario no existe (pudo haber sido eliminado después de emitir el token)
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      // Usuario desactivado
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Retornar el usuario completo (sin la contraseña)
    // Este objeto se inyecta en request.user
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
