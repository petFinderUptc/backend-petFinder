/**
 * Decorador para especificar roles permitidos en un endpoint
 *
 * Uso:
 * @Post()
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * deleteUser(@Param('id') id: string) {
 *   ...
 * }
 *
 * TODO: FASE 2 - Implementar junto con RolesGuard
 */

// import { SetMetadata } from '@nestjs/common';
// import { UserRole } from '../../modules/users/interfaces/user.interface';
//
// export const ROLES_KEY = 'roles';
// export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export {};
