import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.passwordHash !== this.hashToken(dto.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionId = uuidv7();
    const refreshToken = `refresh-${sessionId}`;
    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { accessToken: `access-${sessionId}`, refreshToken, tokenType: 'Bearer' };
  }

  async refresh(dto: RefreshDto) {
    const sessionId = dto.refreshToken.replace('refresh-', '');
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.revokedAt || session.refreshTokenHash !== this.hashToken(dto.refreshToken)) {
      throw new UnauthorizedException('Session revoked');
    }

    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });

    const newSessionId = uuidv7();
    const newRefreshToken = `refresh-${newSessionId}`;
    await this.prisma.session.create({
      data: {
        id: newSessionId,
        userId: session.userId,
        refreshTokenHash: this.hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { accessToken: `access-${newSessionId}`, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    const sessionId = refreshToken.replace('refresh-', '');
    await this.prisma.session.updateMany({ where: { id: sessionId }, data: { revokedAt: new Date() } });
    return { ok: true };
  }

  async getSessionUser(accessToken: string) {
    const sessionId = accessToken.replace('access-', '');
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) throw new UnauthorizedException('Invalid session');

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new UnauthorizedException('Invalid session user');
    const roles = await this.prisma.roleAssignment.findMany({ where: { userId: user.id } });

    const primaryRole = roles[0]?.role || 'guardian';
    const familyRole = roles.find((r) => r.scopeType === 'family');
    const caseRoles = roles
      .filter((r) => r.scopeType === 'case' && r.scopeId !== null)
      .map((r) => r.scopeId as string);

    return {
      id: user.id,
      role: primaryRole,
      familyId: familyRole?.scopeId,
      assignedCaseIds: caseRoles
    };
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
