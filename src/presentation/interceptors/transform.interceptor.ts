/**
 * Interceptor para transformar respuestas
 *
 * Envuelve todas las respuestas en un formato estándar
 *
 * TODO: FASE 2 - Agregar como global interceptor si se desea formato consistente
 */

// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { IApiResponse } from '../interfaces/api-response.interface';
//
// @Injectable()
// export class TransformInterceptor<T>
//   implements NestInterceptor<T, IApiResponse<T>>
// {
//   intercept(
//     context: ExecutionContext,
//     next: CallHandler,
//   ): Observable<IApiResponse<T>> {
//     return next.handle().pipe(
//       map((data) => ({
//         success: true,
//         data,
//         timestamp: new Date(),
//       })),
//     );
//   }
// }

export {};
