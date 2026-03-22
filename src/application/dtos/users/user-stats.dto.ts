import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ example: 20, description: 'Reportes publicados' })
  reportsPublished: number;

  @ApiProperty({ example: 5, description: 'Reencuentros exitosos' })
  successfulReunions: number;

  @ApiProperty({ example: 10, description: 'Mascotas ayudadas' })
  helpedPets: number;

  @ApiProperty({ example: '2021-05-25', description: 'Miembro desde' })
  memberSince: string;
}
