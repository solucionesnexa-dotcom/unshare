import { readFileSync } from 'fs';
import { join } from 'path';

describe('RLS smoke', () => {
  it('enables RLS on sensitive tables', () => {
    const sql = readFileSync(join(__dirname, '../../prisma/migrations/0002_rls/migration.sql'), 'utf8');
    expect(sql).toContain('ALTER TABLE cases ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE findings ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE actions ENABLE ROW LEVEL SECURITY');
  });
});
