import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get<number>('security.bcryptSaltRounds') || 12;
  }

  async hash(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al procesar la contraseña. Por favor, intente nuevamente.'
      );
    }
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al validar las credenciales. Por favor, intente nuevamente.'
      );
    }
  }

  isHashValid(hash: string): boolean {
    const bcryptRegex = /^\$2[aby]\$\d{2}\$.{53}$/;
    return bcryptRegex.test(hash);
  }

  getSaltRounds(): number {
    return this.saltRounds;
  }

  needsRehash(hashedPassword: string): boolean {
    try {
      const rounds = parseInt(hashedPassword.split('$')[2], 10);
      return rounds < this.saltRounds;
    } catch (error) {
      return true;
    }
  }
}
