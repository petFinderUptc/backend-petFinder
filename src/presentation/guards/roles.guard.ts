/**
 * Guard de roles
 *
 * Verifica que el usuario tenga los roles necesarios para acceder a un endpoint.
 * Debe usarse DESPUÉS de JwtAuthGuard (que inyecta el usuario en request.user).
 *
 * Uso:
 * @Delete(':id')
 * @UseGuards(JwtAuthGuard, RolesGuard)  // JwtAuthGuard PRIMERO
 * @Roles(UserRole.ADMIN)
 * deleteUser(@Param('id') id: string) {
 *   return this.usersService.remove(id);
 * }
 *
 * Flujo:
 * 1. Lee los roles requeridos desde los metadata del endpoint
 * 2. Extrae el usuario desde request.user (inyectado por JwtAuthGuard)
 * 3. Verifica que el usuario tenga al menos uno de los roles requeridos
 * 4. Si no tiene permisos, retorna 403 Forbidden
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../domain/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos desde metadata del handler o clase
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Extraer usuario del request (inyectado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario, no debería llegar aquí (JwtAuthGuard debería haberlo bloqueado)
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
