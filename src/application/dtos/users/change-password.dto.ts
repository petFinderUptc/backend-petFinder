import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPass123', description: 'Contraseña actual' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newPass123', description: 'Nueva contraseña' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
