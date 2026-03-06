/**
 * Guard de autenticación JWT
 *
 * Protege rutas que requieren autenticación.
 * Usa JwtStrategy para validar el token y extraer el usuario.
 *
 * Uso:
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user) {
 *   return user;
 * }
 *
 * Flujo:
 * 1. Extrae el token del header Authorization
 * 2. Llama a JwtStrategy.validate()
 * 3. Si es válido, inyecta user en request.user
 * 4. Si no es válido, retorna 401 Unauthorized
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Hereda todo de AuthGuard('jwt')
  // Opcionalmente se pueden sobreescribir métodos para personalizar:
  // - handleRequest() - personalizar manejo de errores
  // - canActivate() - agregar lógica adicional antes de validar
}
