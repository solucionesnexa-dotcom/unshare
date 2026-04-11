"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../src/modules/auth/auth.service");
describe('AuthService flow', () => {
    it('login + refresh + logout lifecycle', async () => {
        const sessions = [];
        const prisma = {
            user: { findUnique: async ({ where }) => (where.email === 'guardian@example.com' ? { id: 'u1', email: where.email, passwordHash: new auth_service_1.AuthService({}).hashToken('Password123!') } : null) },
            session: {
                create: async ({ data }) => sessions.push(data),
                findUnique: async ({ where }) => sessions.find((s) => s.id === where.id) || null,
                update: async ({ where, data }) => {
                    const row = sessions.find((s) => s.id === where.id);
                    Object.assign(row, data);
                    return row;
                },
                updateMany: async () => ({ count: 1 })
            },
            roleAssignment: { findMany: async () => [{ role: 'guardian', scopeType: 'family', scopeId: 'f1' }] }
        };
        const service = new auth_service_1.AuthService(prisma);
        const login = await service.login({ email: 'guardian@example.com', password: 'Password123!' });
        expect(login.accessToken).toContain('access-');
        const refreshed = await service.refresh({ refreshToken: login.refreshToken });
        expect(refreshed.refreshToken).toContain('refresh-');
        const out = await service.logout(refreshed.refreshToken);
        expect(out.ok).toBe(true);
    });
});
//# sourceMappingURL=auth-flow.e2e-spec.js.map