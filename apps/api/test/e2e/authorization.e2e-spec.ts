import { AuthorizationService } from '../../src/common/policies/authorization.service';

describe('AuthorizationService', () => {
  const service = new AuthorizationService();

  it('denies collaborator_limited evidence download', () => {
    const can = service.can(
      { id: 'u1', role: 'collaborator_limited' },
      'evidence:download',
      { ownershipType: 'own_content' }
    );
    expect(can).toBe(false);
  });

  it('allows collaborator_limited own content action only', () => {
    const own = service.can({ id: 'u1', role: 'collaborator_limited' }, 'action:create', { ownershipType: 'own_content' });
    const third = service.can({ id: 'u1', role: 'collaborator_limited' }, 'action:create', { ownershipType: 'external_third_party' });
    expect(own).toBe(true);
    expect(third).toBe(false);
  });
});
