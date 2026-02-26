/**
 * Pipe de validación personalizado para ObjectId de MongoDB/Cosmos
 *
 * TODO: FASE 2 - Implementar cuando se conecte Cosmos DB
 */

// import {
//   PipeTransform,
//   Injectable,
//   ArgumentMetadata,
//   BadRequestException,
// } from '@nestjs/common';
//
// @Injectable()
// export class ParseObjectIdPipe implements PipeTransform<string, string> {
//   transform(value: string, metadata: ArgumentMetadata): string {
//     const validObjectIdRegex = /^[a-f\d]{24}$/i;
//
//     if (!validObjectIdRegex.test(value)) {
//       throw new BadRequestException('ID inválido');
//     }
//
//     return value;
//   }
// }

export {};
