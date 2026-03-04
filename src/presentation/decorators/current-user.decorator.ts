/**
 * Decorador personalizado para obtener el usuario actual desde el request
 *
 * Este decorador extrae el usuario que fue inyectado por JwtAuthGuard
 *
 * Uso:
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: IUser) {
 *   return user;
 * }
 *
 * TODO: FASE 2 - Implementar y usar en controllers protegidos
 */

// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
//
// export const CurrentUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user;
//   },
// );

export {};
