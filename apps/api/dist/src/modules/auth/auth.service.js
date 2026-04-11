"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../prisma.service");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || user.passwordHash !== this.hashToken(dto.password)) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const sessionId = (0, uuid_1.v7)();
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
    async refresh(dto) {
        const sessionId = dto.refreshToken.replace('refresh-', '');
        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session || session.revokedAt || session.refreshTokenHash !== this.hashToken(dto.refreshToken)) {
            throw new common_1.UnauthorizedException('Session revoked');
        }
        await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
        const newSessionId = (0, uuid_1.v7)();
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
    async logout(refreshToken) {
        const sessionId = refreshToken.replace('refresh-', '');
        await this.prisma.session.updateMany({ where: { id: sessionId }, data: { revokedAt: new Date() } });
        return { ok: true };
    }
    async getSessionUser(accessToken) {
        const sessionId = accessToken.replace('access-', '');
        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session || session.revokedAt || session.expiresAt < new Date())
            throw new common_1.UnauthorizedException('Invalid session');
        const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid session user');
        const roles = await this.prisma.roleAssignment.findMany({ where: { userId: user.id } });
        const primaryRole = roles[0]?.role || 'guardian';
        const familyRole = roles.find((r) => r.scopeType === 'family');
        const caseRoles = roles
            .filter((r) => r.scopeType === 'case' && r.scopeId !== null)
            .map((r) => r.scopeId);
        return {
            id: user.id,
            role: primaryRole,
            familyId: familyRole?.scopeId,
            assignedCaseIds: caseRoles
        };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map