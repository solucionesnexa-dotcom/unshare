ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- Defensive layer only. App-layer RBAC+ABAC remains mandatory for business authorization.
CREATE POLICY cases_family_scope ON cases
USING (family_id::text = current_setting('app.current_family_id', true));

CREATE POLICY findings_case_scope ON findings
USING (case_id::text = ANY(string_to_array(current_setting('app.current_case_ids', true), ',')));

CREATE POLICY evidence_case_scope ON finding_evidence
USING (finding_id IN (SELECT id FROM findings));

CREATE POLICY actions_case_scope ON actions
USING (case_id::text = ANY(string_to_array(current_setting('app.current_case_ids', true), ',')));
