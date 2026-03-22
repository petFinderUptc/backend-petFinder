import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'password123', description: 'Contraseña para confirmar eliminación' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
