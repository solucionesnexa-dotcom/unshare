# Unshare — Arquitectura Backend MVP v2

## 1. Executive technical decision

**Se mantiene la decisión base:** monolito modular API-first con NestJS.

**Stack base sin cambios estructurales:** NestJS + PostgreSQL + Redis/BullMQ + MinIO + Vault.

**Ajustes de v2 (hardening):**
- UUID consistente: **UUID v7 generado en aplicación** (no defaults v4 en SQL).
- RBAC + ABAC reforzado con **RLS en tablas críticas** como segunda línea defensiva.
- `ownership_type` tipado como enum obligatorio.
- Ciclo de vida de evidencia con estados y bloqueo operativo antes de scan limpio.
- Reglas de aprobación diferenciadas por tipo de acción (no todo requiere aprobación).

---

## 2. Recommended stack

- **Backend API:** NestJS 11 + TypeScript 5.
- **ORM:** Prisma.
- **DB:** PostgreSQL 16.
- **Queue/cache:** Redis 7 + BullMQ.
- **Object storage:** MinIO (S3 compatible, SSE activo).
- **Secrets:** Vault.
- **Observabilidad:** OpenTelemetry + Prometheus + Grafana + Loki.
- **Id generator:** paquete `uuid` con soporte UUIDv7 en capa de aplicación.

### Decisión UUID (consistencia)
- Se adopta **UUID v7** en todas las entidades.
- Generación en application layer (`uuidv7()`), antes de persistir con Prisma.
- En Prisma: `id String @id @db.Uuid` sin `@default(uuid())`.
- En SQL: columnas UUID **sin default generator**; el id llega desde backend.

---

## 3. System architecture overview

Flujo principal:
1. Request autenticada entra por API.
2. Guard JWT + guard de política (`RBAC + ABAC`) validan scope.
3. Caso de uso ejecuta lógica y transición de estado.
4. Persistencia en PostgreSQL y/o MinIO.
5. Registro en `audit_logs`.
6. Encola jobs asíncronos cuando aplique.

Separación de responsabilidades:
- **Autorización de negocio** siempre en aplicación.
- **RLS** como defensa adicional en tablas sensibles de lectura/escritura.

---

## 4. Bounded modules and responsibilities

1. `auth`: login, refresh, logout, MFA, revocación de sesiones.
2. `iam`: roles, scopes, políticas ABAC, claims de contexto.
3. `families`: hogares y tutores.
4. `minors`: perfil de menor, alias y sensibilidad.
5. `mandates`: legitimación y mandatos.
6. `cases`: expediente, SLA, asignaciones y estado global.
7. `findings`: inventario de hallazgos y clasificación.
8. `actions`: ejecución/seguimiento de acciones y aprobación.
9. `evidence`: vault, hash, estado antimalware, entrega temporal.
10. `notifications`: bandeja, recordatorios, vencimientos.
11. `audit`: trazabilidad inmutable tamper-evident.
12. `integrations`: conectores externos (email/API plataforma), no core transaccional.
13. `metrics`: KPIs del MVP.

---

## 5. Domain model

### Entidades principales
- User, Session, RoleAssignment
- Family, Guardian, Minor, LegalMandate
- Case, CaseAssignment, CaseTimelineEvent
- Finding, FindingEvidence
- Action, ActionApproval, EscalationPacket
- Notification, AuditLog

### Enums obligatorios
- `case_status`
- `finding_status`
- `action_type`
- `action_status`
- `ownership_type`
- `evidence_status`

### ownership_type (normalizado)
- `own_content`
- `family_third_party`
- `external_third_party`
- `platform_copy`
- `search_result`

Impacto en acciones:
- `own_content`: permite `delete_own`, `archive_own`, `privatize_own`.
- `family_third_party`/`external_third_party`: prioriza `friendly_request` y luego escalado.
- `platform_copy`/`search_result`: va a escalado plataforma/buscador.

---

## 6. Database schema proposal

Convenciones:
- UUID v7 app-generated.
- UTC obligatorio.
- Soft delete en entidades de negocio (no en audit).

Tablas base:
- users, sessions, roles, role_assignments
- families, guardians, minors, legal_mandates
- cases, case_assignments, case_timeline_events
- findings, finding_evidence
- actions, action_approvals, escalation_packets
- notifications, audit_logs, idempotency_keys

---

## 7. Entity relationships

- family 1:N guardians
- family 1:N minors
- family 1:N cases
- case 1:N findings
- finding 1:N evidence
- finding 1:N actions
- action 0..N approvals
- case 1:N timeline events

Regla de scope:
- acceso por `family_id` + `case_assignment` + ownership del finding.

---

## 8. API design and endpoint list

Base: `/api/v1`

### Auth
- `POST /auth/login`
- `POST /auth/mfa/verify`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Family & minor setup
- `POST /families`
- `POST /families/:familyId/guardians`
- `POST /families/:familyId/minors`
- `POST /minors/:minorId/mandates`

### Cases
- `POST /cases`
- `GET /cases`
- `GET /cases/:caseId`
- `PATCH /cases/:caseId/status`
- `POST /cases/:caseId/assignments`

### Findings
- `POST /cases/:caseId/findings`
- `GET /cases/:caseId/findings`
- `GET /findings/:findingId`
- `PATCH /findings/:findingId`
- `PATCH /findings/:findingId/status`

### Actions
- `POST /findings/:findingId/actions/delete-own`
- `POST /findings/:findingId/actions/archive-own`
- `POST /findings/:findingId/actions/privatize-own`
- `POST /findings/:findingId/actions/friendly-request`
- `POST /findings/:findingId/actions/escalate-platform`
- `POST /findings/:findingId/actions/escalate-search`
- `POST /findings/:findingId/actions/escalate-urgent`
- `POST /actions/:actionId/approve`
- `PATCH /actions/:actionId/status`

### Evidence
- `POST /findings/:findingId/evidence/upload-url`
- `POST /findings/:findingId/evidence`
- `GET /findings/:findingId/evidence`
- `GET /evidence/:evidenceId/download-url`

### Audit / notifications / metrics
- `GET /notifications`
- `PATCH /notifications/:notificationId/read`
- `GET /audit`
- `GET /metrics/kpis`

**Regla dura:** todo endpoint con `caseId`, `findingId`, `minorId`, `actionId`, `evidenceId` ejecuta autorización object-level en backend.

---

## 9. Authorization model

### Modelo
- Capa 1: RBAC (capacidad por rol).
- Capa 2: ABAC (scope por objeto/contexto).
- Capa 3: RLS PostgreSQL en tablas sensibles.

### RLS recomendado (segunda defensa)
Aplicar en:
- `cases`
- `findings`
- `finding_evidence`
- `actions`

No delegar en RLS:
- transiciones de estado,
- reglas de aprobación,
- reglas de ownership/acción,
- checks de mandato/legalidad.

Esas quedan en servicio de dominio.

### collaborator_limited (definición mínima segura)
**Puede:**
- leer solo findings con `ownership_type=own_content` en casos donde está vinculado.
- ver campos: `finding.id`, `url` parcial enmascarada, `platform`, `status`, `recommended_action`.
- ejecutar `delete_own/archive_own/privatize_own` si es contenido propio marcado.

**No puede:**
- ver identidad de menor (nombre real/alias).
- descargar evidencia.
- ver audit logs.
- aprobar acciones.
- crear escalados ni friendly requests.
- ver findings de terceros.

---

## 10. State machines

### Case states
- `open`
- `in_review`
- `action_in_progress`
- `waiting_response`
- `partially_resolved`
- `resolved`
- `closed`

### Finding states
- `detected`
- `validated`
- `pending_approval`
- `action_prepared`
- `sent`
- `resolved_removed`
- `resolved_archived`
- `rejected`
- `closed`

### Action approval rules (v2)
- `delete_own` / `archive_own` / `privatize_own`:
  - **sin aprobación** cuando guardian actúa sobre `own_content` individual.
  - **con aprobación** en bulk irreversible.
- `friendly_request`:
  - aprobación ligera configurable (default: sí para operator envía; opcional para guardian envío directo).
- `escalate_platform` / `escalate_search` / `escalate_urgent`:
  - **siempre requieren aprobación**.

Ajuste de flujo:
- acciones sin aprobación: `action_prepared -> sent` directo.
- con aprobación: `action_prepared -> pending_approval -> sent`.

---

## 11. Evidence storage design

### evidence_status (nuevo)
- `uploaded_pending_scan`
- `available`
- `quarantined`
- `rejected`

### Flujo operativo
1. Presigned upload.
2. Registro evidencia en DB como `uploaded_pending_scan`.
3. Job antivirus/hash.
4. Si clean => `available`; si malware => `quarantined`; si inválida/ilegible => `rejected`.

**Regla:** evidencia no usable para escalado mientras no esté en `available`.

---

## 12. Async jobs and queues

Colas:
- `evidence.scan`
- `notifications.send`
- `case.sla.reminder`
- `action.followup`
- `retention.purge`

Controles:
- retries exponenciales + DLQ.
- idempotencia con `job_dedup_key`.
- timeout por tipo de job.

---

## 13. Audit and observability

### Audit chain v2 (aclaración)
- `curr_hash = SHA256(prev_hash + canonical_event_payload)`.
- `canonical_event_payload` incluye: timestamp, actor, action, object_type, object_id, metadata normalizada.
- Cadena **global por entorno** (dev/stg/prod), no por tabla.
- checkpoint diario firmado (hash final del día) guardado fuera de DB (object storage inmutable).

### Si falla escritura de audit
- operación sensible retorna error (fail-closed) excepto lectura simple.
- para operaciones no sensibles permitidas, registrar incidente de observabilidad + retry síncrono corto.

### Alcance legal
- Es **tamper-evident** para MVP.
- No se declara no repudio legal pleno (requeriría HSM/firma externa avanzada).

---

## 14. Security controls

- TLS 1.2+.
- secretos sólo en Vault.
- cifrado at-rest en Postgres/MinIO.
- cifrado app-level de PII sensible.
- validación DTO strict + sanitización URL/texto.
- response DTOs con minimización de datos por rol.
- rate-limit + brute-force protection en auth.
- idempotency keys obligatorias en acciones críticas.
- MFA obligatorio operator/admin.
- deny-by-default en autorizaciones.

---

## 15. Deployment architecture

Entornos:
- dev: docker compose
- staging/prod: k8s

Pods:
- api
- worker
- redis
- postgres
- minio
- vault
- observability stack

Controles:
- DB y MinIO en red privada.
- rotación de secretos automática.
- backups cifrados con prueba de restore semanal.

---

## 16. Folder structure proposal

```txt
apps/api/
  src/
    main.ts
    app.module.ts
    common/
      guards/
      decorators/
      interceptors/
      policies/
      crypto/
    modules/
      auth/
      iam/
      families/
      minors/
      mandates/
      cases/
      findings/
      actions/
      evidence/
      notifications/
      audit/
      integrations/
      metrics/
    jobs/
      processors/
  prisma/
    schema.prisma
    migrations/
  test/
    e2e/
```

---

## 17. MVP implementation order

1. bootstrap + config segura + health.
2. auth + sessions revocables + MFA.
3. RBAC/ABAC + policy tests por endpoint.
4. families/minors/mandates.
5. cases + estados + assignments.
6. findings + ownership enum + dedupe URL.
7. evidence lifecycle completo.
8. actions + approval rules v2 + idempotencia.
9. audit chain + notifications + SLA jobs.
10. hardening + RLS + pruebas e2e de permisos.

---

## 18. What to reuse from current repo

- taxonomía funcional de hallazgos.
- diseño conceptual de dashboard/lista/ficha.
- copy y flujo funcional de escenarios MVP (no simulación técnica).

---

## 19. What to remove or postpone to phase 2

Fuera de MVP (explícito):
- reconocimiento facial real.
- biometría real.
- scraping masivo universal.
- bot autónomo de borrado.
- white-label empresarial multi-tenant.

Posponer:
- integraciones profundas automáticas por plataforma.
- scoring IA avanzado.

---

## 20. Main technical risks and mitigations

1. **Errores de autorización objeto a objeto**
   - mitigación: policy tests e2e + RLS en tablas críticas.
2. **Uso prematuro de evidencia comprometida**
   - mitigación: evidence_status + bloqueo operativo hasta `available`.
3. **Aprobaciones mal configuradas**
   - mitigación: rules engine por action_type + tests de transición.
4. **Inconsistencia de IDs**
   - mitigación: UUIDv7 app-level obligatorio + lint de schema.
5. **Trazabilidad incompleta**
   - mitigación: audit fail-closed en operaciones sensibles.

---

## 21. SQL schema draft for PostgreSQL (actualizado)

```sql
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE role_code AS ENUM ('guardian','operator','admin','collaborator_limited');
CREATE TYPE case_status AS ENUM ('open','in_review','action_in_progress','waiting_response','partially_resolved','resolved','closed');
CREATE TYPE finding_status AS ENUM ('detected','validated','pending_approval','action_prepared','sent','resolved_removed','resolved_archived','rejected','closed');
CREATE TYPE action_type AS ENUM ('delete_own','archive_own','privatize_own','friendly_request','escalate_platform','escalate_search','escalate_urgent');
CREATE TYPE action_status AS ENUM ('draft','pending_approval','approved','sent','completed','failed','cancelled');
CREATE TYPE ownership_type AS ENUM ('own_content','family_third_party','external_third_party','platform_copy','search_result');
CREATE TYPE evidence_status AS ENUM ('uploaded_pending_scan','available','quarantined','rejected');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cases (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL,
  primary_guardian_id UUID NOT NULL,
  status case_status NOT NULL DEFAULT 'open',
  priority SMALLINT NOT NULL DEFAULT 3,
  sla_due_at TIMESTAMPTZ,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE findings (
  id UUID PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id),
  minor_id UUID NOT NULL,
  url TEXT NOT NULL,
  url_fingerprint TEXT NOT NULL,
  platform TEXT NOT NULL,
  ownership_type ownership_type NOT NULL,
  risk_score SMALLINT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  status finding_status NOT NULL DEFAULT 'detected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(case_id, url_fingerprint)
);

CREATE TABLE finding_evidence (
  id UUID PRIMARY KEY,
  finding_id UUID NOT NULL REFERENCES findings(id),
  object_key TEXT NOT NULL,
  sha256 CHAR(64) NOT NULL,
  mime_type TEXT NOT NULL,
  status evidence_status NOT NULL DEFAULT 'uploaded_pending_scan',
  captured_by UUID NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE actions (
  id UUID PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id),
  finding_id UUID NOT NULL REFERENCES findings(id),
  action_type action_type NOT NULL,
  status action_status NOT NULL DEFAULT 'draft',
  requires_approval BOOLEAN NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  prepared_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID,
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  prev_hash TEXT,
  curr_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_findings_case_status ON findings(case_id, status);
CREATE INDEX idx_evidence_finding_status ON finding_evidence(finding_id, status);
CREATE INDEX idx_actions_finding_status ON actions(finding_id, status);
```

RLS (ejemplo mínimo, a completar por entorno):
```sql
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
```

---

## 22. Example REST endpoint payloads and responses

### POST /api/v1/findings/:findingId/actions/escalate-platform
Request:
```json
{
  "channel": "platform_form",
  "reason": "minor_privacy",
  "evidenceIds": ["018f6f4d-3d12-7e3a-8ea3-bf6e4e12d911"]
}
```
Response 202:
```json
{
  "actionId": "018f6f4d-3d12-7e3a-8ea3-bf6e4e12d999",
  "status": "pending_approval",
  "requiresApproval": true
}
```

### GET /api/v1/findings/:findingId/evidence
Response 200:
```json
[
  {
    "id": "018f6f4d-3d12-7e3a-8ea3-bf6e4e12d911",
    "status": "available",
    "mimeType": "image/png",
    "capturedAt": "2026-04-11T18:20:00Z"
  }
]
```

---

## 23. RBAC + ABAC permission matrix by endpoint (actualizada)

| Endpoint | guardian | operator | admin | collaborator_limited | Approval | Notas ABAC |
|---|---|---|---|---|---|---|
| POST /cases | ✅ | ✅ | ✅ | ❌ | No | family scope |
| GET /cases/:caseId | ✅ | ✅ asignado | ✅ | ❌ | No | case belongs scope |
| POST /cases/:caseId/findings | ✅ | ✅ asignado | ✅ | ❌ | No | case+minor scope |
| POST /findings/:id/actions/delete-own | ✅ | ✅ | ✅ | ✅ | No* | solo own_content |
| POST /findings/:id/actions/archive-own | ✅ | ✅ | ✅ | ✅ | No* | solo own_content |
| POST /findings/:id/actions/privatize-own | ✅ | ✅ | ✅ | ✅ | No* | solo own_content |
| POST /findings/:id/actions/friendly-request | ✅ | ✅ | ✅ | ❌ | Configurable | no own-only required |
| POST /findings/:id/actions/escalate-platform | ✅ | ✅ | ✅ | ❌ | Sí | evidencia `available` obligatoria |
| POST /findings/:id/actions/escalate-search | ✅ | ✅ | ✅ | ❌ | Sí | evidencia `available` obligatoria |
| POST /findings/:id/actions/escalate-urgent | ❌ directo | ✅ | ✅ | ❌ | Sí + doble revisión | alta severidad |
| POST /actions/:actionId/approve | ✅ (si owner caso) | ✅ | ✅ | ❌ | N/A | object-level strict |
| GET /evidence/:evidenceId/download-url | ✅ | ✅ | ✅ | ❌ | No | status=available only |

\* Requiere aprobación si es operación masiva irreversible.

---

## 24. Initial migration plan

1. `M0001_core_auth_iam`.
2. `M0002_family_minor_case`.
3. `M0003_findings_with_ownership_enum`.
4. `M0004_evidence_with_status_enum`.
5. `M0005_actions_requires_approval`.
6. `M0006_audit_chain_fields`.
7. `M0007_rls_enablement_sensitive_tables`.
8. `M0008_indexes_retention_sla`.

---

## 25. Skeleton backend folder/file tree

```txt
apps/api/src/
  common/
    policies/
      authorization.service.ts
      rls-context.service.ts
    audit/
      audit-chain.service.ts
  modules/
    actions/
      approval-rules.service.ts
    evidence/
      evidence-status.service.ts
    findings/
      ownership-policy.service.ts
    audit/
      audit-write.service.ts
  jobs/processors/
    evidence-scan.processor.ts
    retention-purge.processor.ts
```

---

## 26. First 10 implementation tickets in execution order

1. UUIDv7 strategy in Nest + Prisma (remove DB-generated UUID defaults).
2. Add CITEXT + enum migrations (`ownership_type`, `evidence_status`).
3. Build authorization middleware (RBAC+ABAC object checks mandatory).
4. Implement collaborator_limited restricted DTOs and route guards.
5. Implement action approval rules matrix in domain service.
6. Implement evidence lifecycle states + antivirus worker gating.
7. Implement escalation preconditions (evidence available mandatory).
8. Enable RLS for cases/findings/evidence/actions + policy bootstrap.
9. Implement audit hash chain + daily checkpoint exporter.
10. Add e2e suite: authorization, state transitions, approval paths, RLS smoke.

---

## 27. Reglas operativas y de gobierno del MVP

1. **Revisión humana obligatoria**:
   - siempre en `escalate_platform`, `escalate_search`, `escalate_urgent`, y acciones bulk irreversibles.
2. **Evidencia mínima para escalado**:
   - al menos 1 evidencia en `available` + URL normalizada + mandato vigente.
3. **Datos mínimos de guardian**:
   - email verificado, relación legal, consentimiento/mandato activo para el menor.
4. **Condiciones de cierre de caso**:
   - todos los findings en `resolved_*` o `closed`, nota final obligatoria, checklist de trazabilidad completo.
5. **Retención y purga**:
   - cierre de caso inicia timer de retención configurable (ej. 12 meses); luego purga programada de evidencia y minimización de PII.
6. **SLA por severidad**:
   - `high`: primera acción < 24h.
   - `medium`: < 72h.
   - `low`: < 7 días.
7. **Disciplina de alcance MVP**:
   - explícitamente fuera: biometría real, scraping masivo, bot autónomo, white-label enterprise.
