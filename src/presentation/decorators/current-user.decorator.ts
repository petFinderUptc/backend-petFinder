/**
 * Decorador personalizado para obtener el usuario actual desde el request
 *
 * Este decorador extrae el usuario que fue inyectado por JwtAuthGuard.
 * Debe usarse SOLO en endpoints protegidos con @UseGuards(JwtAuthGuard).
 *
 * Uso:
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: UserFromJwt) {
 *   return user;  // { id, email, username, firstName, lastName, role }
 * }
 *
 * También puedes extraer propiedades específicas:
 * @Get('email')
 * @UseGuards(JwtAuthGuard)
 * getEmail(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Interfaz para el usuario extraído del JWT
 */
export interface UserFromJwt {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserFromJwt | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica una propiedad, retornar solo esa propiedad
    if (data) {
      return user?.[data];
    }

    // Retornar el usuario completo
    return user;
  },
);
