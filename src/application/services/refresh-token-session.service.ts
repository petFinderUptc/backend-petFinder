import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { CosmosDbService } from '../../infrastructure/database';
import { AuthSessionDocument } from '../../infrastructure/database/types/auth-session-document.type';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
}

interface RefreshPayload {
  sub: string;
  email: string;
  type: 'refresh';
  sid: string;
}

@Injectable()
export class RefreshTokenSessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cosmosDbService: CosmosDbService,
  ) {}

  async issueTokenPair(userId: string, email: string): Promise<TokenPair> {
    const accessToken = this.jwtService.sign({ sub: userId, email });

    const sessionId = randomUUID();
    const refreshToken = await this.signRefreshToken(userId, email, sessionId);

    const now = new Date();
    const expiresAt = this.resolveRefreshExpiryDate();

    const sessionDoc: AuthSessionDocument = {
      id: sessionId,
      userId,
      email,
      tokenHash: this.hash(refreshToken),
      expiresAt: expiresAt.toISOString(),
      isRevoked: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await this.cosmosDbService.getSessionsContainer().items.create(sessionDoc);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  async rotateTokenPair(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const sessionDoc = await this.findSessionById(payload.sid, payload.sub);
    if (!sessionDoc || sessionDoc.isRevoked) {
      throw new UnauthorizedException('Sesion de refresh invalida o revocada');
    }

    if (new Date(sessionDoc.expiresAt).getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    const incomingHash = this.hash(refreshToken);
    if (sessionDoc.tokenHash !== incomingHash) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    await this.revokeSession(sessionDoc.id, sessionDoc.userId);

    return this.issueTokenPair(payload.sub, payload.email);
  }

  async revokeByToken(refreshToken?: string): Promise<void> {
    const token = (refreshToken || '').trim();
    if (!token) {
      return;
    }

    let payload: RefreshPayload;
    try {
      payload = await this.verifyRefreshToken(token);
    } catch {
      return;
    }

    await this.revokeSession(payload.sid, payload.sub);
  }

  async revokeAllByUser(userId: string): Promise<void> {
    const { resources } = await this.cosmosDbService
      .getSessionsContainer()
      .items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.isRevoked = false',
        parameters: [{ name: '@userId', value: userId }],
      })
      .fetchAll();

    await Promise.all(
      resources.map((session) =>
        this.revokeSession(session.id as string, session.userId as string),
      ),
    );
  }

  private async signRefreshToken(
    userId: string,
    email: string,
    sessionId: string,
  ): Promise<string> {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');

    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
        type: 'refresh',
        sid: sessionId,
      },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      },
    );
  }

  private async verifyRefreshToken(token: string): Promise<RefreshPayload> {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    const payload = (await this.jwtService.verifyAsync(token, {
      secret: refreshSecret,
    })) as RefreshPayload;

    if (payload.type !== 'refresh' || !payload.sid || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    return payload;
  }

  private async findSessionById(
    sessionId: string,
    userId: string,
  ): Promise<AuthSessionDocument | null> {
    const { resources } = await this.cosmosDbService
      .getSessionsContainer()
      .items.query({
        query: 'SELECT * FROM c WHERE c.id = @id AND c.userId = @userId',
        parameters: [
          { name: '@id', value: sessionId },
          { name: '@userId', value: userId },
        ],
      })
      .fetchAll();

    if (!resources.length) {
      return null;
    }

    return resources[0] as AuthSessionDocument;
  }

  private async revokeSession(sessionId: string, userId: string): Promise<void> {
    const sessionDoc = await this.findSessionById(sessionId, userId);
    if (!sessionDoc || sessionDoc.isRevoked) {
      return;
    }

    const now = new Date().toISOString();
    const updatedDoc: AuthSessionDocument = {
      ...sessionDoc,
      isRevoked: true,
      updatedAt: now,
      revokedAt: now,
    };

    await this.cosmosDbService.getSessionsContainer().item(sessionId, userId).replace(updatedDoc);
  }

  private resolveRefreshExpiryDate(): Date {
    const configured = this.configService.get<string>('jwt.refreshExpiresIn') || '30d';

    const match = configured.match(/^(\d+)([smhd])$/i);
    if (!match) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amount * unitMs[unit]);
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
