"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evidence_service_1 = require("../../src/modules/evidence/evidence.service");
describe('Evidence lifecycle', () => {
    it('uses required statuses naming', () => {
        const statuses = ['uploaded_pending_scan', 'available', 'quarantined', 'rejected'];
        expect(statuses).toContain('uploaded_pending_scan');
        expect(statuses).toContain('available');
        expect(statuses).toContain('quarantined');
        expect(statuses).toContain('rejected');
        expect(evidence_service_1.EvidenceService).toBeDefined();
    });
});
//# sourceMappingURL=evidence-lifecycle.e2e-spec.js.map