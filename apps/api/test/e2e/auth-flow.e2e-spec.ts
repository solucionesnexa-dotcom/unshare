import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService flow', () => {
  it('login + refresh + logout lifecycle', async () => {
    const sessions: any[] = [];
    const prisma: any = {
      user: { findUnique: async ({ where }: any) => (where.email === 'guardian@example.com' ? { id: 'u1', email: where.email, passwordHash: new AuthService({} as any).hashToken('Password123!') } : null) },
      session: {
        create: async ({ data }: any) => sessions.push(data),
        findUnique: async ({ where }: any) => sessions.find((s) => s.id === where.id) || null,
        update: async ({ where, data }: any) => {
          const row = sessions.find((s) => s.id === where.id);
          Object.assign(row, data);
          return row;
        },
        updateMany: async () => ({ count: 1 })
      },
      roleAssignment: { findMany: async () => [{ role: 'guardian', scopeType: 'family', scopeId: 'f1' }] }
    };

    const service = new AuthService(prisma);
    const login = await service.login({ email: 'guardian@example.com', password: 'Password123!' });
    expect(login.accessToken).toContain('access-');

    const refreshed = await service.refresh({ refreshToken: login.refreshToken });
    expect(refreshed.refreshToken).toContain('refresh-');

    const out = await service.logout(refreshed.refreshToken);
    expect(out.ok).toBe(true);
  });
});
