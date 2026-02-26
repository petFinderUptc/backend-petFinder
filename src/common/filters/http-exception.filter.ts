/**
 * Filtro de excepciones HTTP
 *
 * Captura todas las excepciones HTTP y las formatea de manera consistente
 *
 * TODO: FASE 2 - Agregar como global filter en main.ts
 */

// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { Response } from 'express';
//
// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const status = exception.getStatus();
//     const exceptionResponse = exception.getResponse();
//
//     const errorResponse = {
//       success: false,
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       message:
//         typeof exceptionResponse === 'string'
//           ? exceptionResponse
//           : (exceptionResponse as any).message,
//       errors:
//         typeof exceptionResponse === 'object' && (exceptionResponse as any).errors
//           ? (exceptionResponse as any).errors
//           : [],
//     };
//
//     response.status(status).json(errorResponse);
//   }
// }

export {};
