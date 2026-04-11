import { ActionsService } from '../../src/modules/actions/actions.service';

describe('Approval rules', () => {
  it('guardian own_content delete individual does not require approval', () => {
    const fn = (ActionsService.prototype as any).computeApproval.bind({});
    expect(fn('delete_own', 'own_content', 'guardian', false)).toBe(false);
  });

  it('escalate_platform always requires approval', () => {
    const fn = (ActionsService.prototype as any).computeApproval.bind({});
    expect(fn('escalate_platform', 'own_content', 'guardian', false)).toBe(true);
  });
});
