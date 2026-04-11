"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_service_1 = require("../../src/modules/actions/actions.service");
describe('Approval rules', () => {
    it('guardian own_content delete individual does not require approval', () => {
        const fn = actions_service_1.ActionsService.prototype.computeApproval.bind({});
        expect(fn('delete_own', 'own_content', 'guardian', false)).toBe(false);
    });
    it('escalate_platform always requires approval', () => {
        const fn = actions_service_1.ActionsService.prototype.computeApproval.bind({});
        expect(fn('escalate_platform', 'own_content', 'guardian', false)).toBe(true);
    });
});
//# sourceMappingURL=approval-rules.e2e-spec.js.map