/**
 * Guard de roles
 *
 * Verifica que el usuario tenga los roles necesarios para acceder a un endpoint
 *
 * TODO: FASE 2 - Implementar completamente
 */

// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { UserRole } from '../../modules/users/interfaces/user.interface';
// import { ROLES_KEY } from '../decorators/roles.decorator';
//
// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}
//
//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//
//     if (!requiredRoles) {
//       return true;
//     }
//
//     const { user } = context.switchToHttp().getRequest();
//     return requiredRoles.some((role) => user.role === role);
//   }
// }

export {};
