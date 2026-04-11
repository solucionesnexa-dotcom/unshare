CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE role_code AS ENUM ('guardian','operator','admin','collaborator_limited');
CREATE TYPE case_status AS ENUM ('open','in_review','action_in_progress','waiting_response','partially_resolved','resolved','closed');
CREATE TYPE finding_status AS ENUM ('detected','validated','pending_approval','action_prepared','sent','resolved_removed','resolved_archived','rejected','closed');
CREATE TYPE action_type AS ENUM ('delete_own','archive_own','privatize_own','friendly_request','escalate_platform','escalate_search','escalate_urgent');
CREATE TYPE action_status AS ENUM ('draft','pending_approval','approved','sent','completed','failed','cancelled');
CREATE TYPE ownership_type AS ENUM ('own_content','family_third_party','external_third_party','platform_copy','search_result');
CREATE TYPE evidence_status AS ENUM ('uploaded_pending_scan','available','quarantined','rejected');

CREATE TABLE users (id UUID PRIMARY KEY, email CITEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, mfa_enabled BOOLEAN NOT NULL DEFAULT false, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE sessions (id UUID PRIMARY KEY, user_id UUID NOT NULL, refresh_token_hash TEXT NOT NULL, revoked_at TIMESTAMPTZ, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE role_assignments (id UUID PRIMARY KEY, user_id UUID NOT NULL, role role_code NOT NULL, scope_type TEXT NOT NULL, scope_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE families (id UUID PRIMARY KEY, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE guardians (id UUID PRIMARY KEY, family_id UUID NOT NULL, user_id UUID NOT NULL, legal_relationship TEXT NOT NULL, phone_enc BYTEA, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE minors (id UUID PRIMARY KEY, family_id UUID NOT NULL, first_name_enc BYTEA NOT NULL, aliases_json JSONB NOT NULL DEFAULT '[]'::jsonb, sensitivity_tags_json JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE legal_mandates (id UUID PRIMARY KEY, family_id UUID NOT NULL, minor_id UUID NOT NULL, guardian_id UUID NOT NULL, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE cases (id UUID PRIMARY KEY, family_id UUID NOT NULL, primary_guardian_id UUID NOT NULL, status case_status NOT NULL DEFAULT 'open', priority INT NOT NULL, summary TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE case_assignments (id UUID PRIMARY KEY, case_id UUID NOT NULL, user_id UUID NOT NULL, role_in_case TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE findings (id UUID PRIMARY KEY, case_id UUID NOT NULL, minor_id UUID NOT NULL, url TEXT NOT NULL, url_fingerprint TEXT NOT NULL, platform TEXT NOT NULL, ownership_type ownership_type NOT NULL, risk_score INT NOT NULL, status finding_status NOT NULL DEFAULT 'detected', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (case_id, url_fingerprint));
CREATE TABLE finding_evidence (id UUID PRIMARY KEY, finding_id UUID NOT NULL, object_key TEXT NOT NULL, sha256 CHAR(64) NOT NULL, mime_type TEXT NOT NULL, status evidence_status NOT NULL DEFAULT 'uploaded_pending_scan', captured_by UUID NOT NULL, captured_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE actions (id UUID PRIMARY KEY, case_id UUID NOT NULL, finding_id UUID NOT NULL, action_type action_type NOT NULL, status action_status NOT NULL DEFAULT 'draft', requires_approval BOOLEAN NOT NULL, idempotency_key TEXT NOT NULL UNIQUE, payload JSONB NOT NULL DEFAULT '{}'::jsonb, prepared_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE action_approvals (id UUID PRIMARY KEY, action_id UUID NOT NULL, approver_id UUID NOT NULL, decision TEXT NOT NULL, reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE notifications (id UUID PRIMARY KEY, user_id UUID NOT NULL, type TEXT NOT NULL, payload JSONB NOT NULL DEFAULT '{}'::jsonb, read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE audit_logs (id UUID PRIMARY KEY, actor_user_id UUID, action TEXT NOT NULL, object_type TEXT NOT NULL, object_id UUID, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, prev_hash TEXT, curr_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE INDEX idx_cases_family_status ON cases(family_id, status);
CREATE INDEX idx_findings_case_status ON findings(case_id, status);
CREATE INDEX idx_findings_ownership ON findings(ownership_type);
CREATE INDEX idx_evidence_finding_status ON finding_evidence(finding_id, status);
CREATE INDEX idx_actions_finding_status ON actions(finding_id, status);
CREATE INDEX idx_case_assignments_case_user ON case_assignments(case_id, user_id);
