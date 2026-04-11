"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
describe('RLS smoke', () => {
    it('enables RLS on sensitive tables', () => {
        const sql = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../prisma/migrations/0002_rls/migration.sql'), 'utf8');
        expect(sql).toContain('ALTER TABLE cases ENABLE ROW LEVEL SECURITY');
        expect(sql).toContain('ALTER TABLE findings ENABLE ROW LEVEL SECURITY');
        expect(sql).toContain('ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY');
        expect(sql).toContain('ALTER TABLE actions ENABLE ROW LEVEL SECURITY');
    });
});
//# sourceMappingURL=rls-smoke.e2e-spec.js.map