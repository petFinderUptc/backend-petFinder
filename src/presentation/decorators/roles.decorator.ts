/**
 * Decorador para especificar roles permitidos en un endpoint
 *
 * Debe usarse junto con JwtAuthGuard y RolesGuard.
 *
 * Uso:
 * @Delete(':id')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * deleteUser(@Param('id') id: string) {
 *   return this.usersService.remove(id);
 * }
 *
 * Múltiples roles (OR - con que tenga uno es suficiente):
 * @Get('admin-or-moderator')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN, UserRole.MODERATOR)
 * getData() {
 *   return 'Solo admins o moderadores';
 * }
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../domain/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
