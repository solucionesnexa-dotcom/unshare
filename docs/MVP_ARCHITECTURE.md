# Unshare / GuardianKids — MVP real (Portal Familiar + Backoffice Nexa)

## 1) Arquitectura general del sistema

### Decisión
**Monolito modular API-first** (no microservicios en MVP).

### Stack elegido (self-hosted, soberano)
- **Frontend web**: Next.js (App Router, TypeScript), SSR + CSR híbrido.
- **Backend API**: NestJS modular (TypeScript), OpenAPI, validación `class-validator`.
- **DB**: PostgreSQL 16 (RLS + cifrado de campo app-level).
- **Cache/cola**: Redis + BullMQ (jobs de notificaciones, recordatorios, expiraciones SLA).
- **Object storage cifrado**: S3-compatible (MinIO self-hosted con SSE).
- **Secret vault**: HashiCorp Vault (o Doppler self-hosted equivalente).
- **Observabilidad**: OpenTelemetry + Prometheus + Grafana + Loki.
- **Orquestación externa**: n8n solo para conectores no críticos (never core transaccional).

### Componentes
1. **Web App**: Portal Familiar + Backoffice en mismo frontend con layouts por rol.
2. **API Core**:
   - Auth & IAM
   - Families & Guardians
   - Minor Profiles
   - Cases
   - Findings
   - Actions
   - Evidence Vault
   - Notifications
   - Audit
3. **Workers**:
   - SLA reminders
   - Escalation follow-up
   - Digest de notificaciones
4. **Data plane**:
   - PostgreSQL (datos transaccionales)
   - MinIO (evidencia y anexos)
   - Redis (colas/rate limit/token revocación)

### Seguridad (MVP obligatorio)
- JWT corto + refresh rotatorio + blacklist revocable.
- MFA TOTP obligatorio para `operator` y `admin`.
- **Autorización por objeto** en cada endpoint (`case_id`, `minor_id`, `finding_id`, `action_id`).
- Cifrado TLS en tránsito.
- Cifrado en reposo DB + object storage.
- Cifrado de campo (ej. nombres de menor, notas sensibles, contacto tercero).
- Idempotency keys en acciones críticas (`POST /actions/*`).
- Logs de auditoría inmutables (append-only table + hash chain simple).
- Revisión humana obligatoria antes de `escalado_urgente` o cierre irreversible.

### Trade-offs
- Monolito modular acelera entrega y reduce coste operativo.
- Se sacrifica escalado independiente por módulo (aceptable MVP).
- RLS + policy layer duplica esfuerzo inicial, pero evita fugas de datos por multi-tenant familiar.

---

## 2) Estructura de carpetas del proyecto

```txt
/unshare
  /apps
    /web                # Next.js portal familiar + backoffice
      /src
        /app
          /(public)
          /(guardian)
          /(operator)
          /(admin)
        /components
        /features
        /lib
    /api                # NestJS modular
      /src
        /modules
          /auth
          /iam
          /families
          /minors
          /cases
          /findings
          /actions
          /evidence
          /notifications
          /audit
          /metrics
        /common
        /jobs
        /config
  /packages
    /shared-types
    /ui-kit
    /eslint-config
  /infra
    /docker
    /k8s
    /terraform
  /docs
    MVP_ARCHITECTURE.md
```

---

## 3) Modelo de dominio

### Entidades núcleo
- **User** (cuenta autenticable)
- **RoleAssignment** (user + role + scope)
- **Family**
- **GuardianProfile** (persona tutora)
- **MinorProfile**
- **LegalMandate** (legitimación/consentimiento)
- **Case**
- **Finding**
- **FindingEvidence**
- **Action**
- **ActionMessageTemplate** (amistosa/escalado editable)
- **EscalationPacket**
- **CaseTimelineEvent**
- **Notification**
- **AuditLog**

### Relaciones clave
- Family 1..N Guardians
- Family 1..N Minors
- Case N..1 Family, N..1 PrimaryGuardian
- Case 1..N Findings
- Finding 1..N Actions
- Finding 1..N Evidence
- Case 1..N TimelineEvents

### Máquina de estados
**Finding**: `detected -> validated -> pending_approval -> action_prepared -> sent -> resolved_removed|resolved_archived|rejected -> closed`

**Case**: `open -> in_review -> action_in_progress -> waiting_response -> partially_resolved|resolved -> closed`

Regla: transición a `closed` solo con checklist de evidencia y nota final obligatoria.

---

## 4) Esquema de base de datos (PostgreSQL)

### Tablas principales (resumen)
- `users(id, email, password_hash, mfa_enabled, status, created_at)`
- `roles(id, code)` (`guardian`, `operator`, `admin`, `collaborator_limited`)
- `role_assignments(id, user_id, role_id, scope_type, scope_id)`
- `families(id, display_name, created_by, created_at)`
- `guardians(id, family_id, user_id, legal_relationship, phone_enc, created_at)`
- `minors(id, family_id, first_name_enc, aliases_jsonb, sensitivity_tags_jsonb, created_at)`
- `legal_mandates(id, family_id, minor_id, guardian_id, type, status, file_object_key, expires_at)`
- `cases(id, family_id, primary_guardian_id, status, sla_due_at, priority, summary, created_at)`
- `case_assignments(id, case_id, user_id, role_in_case)`
- `findings(id, case_id, minor_id, url, platform, author_handle, content_type, ownership_type, risk_score, priority, status, recommended_action, detected_at)`
- `finding_evidence(id, finding_id, object_key, sha256, mime_type, captured_at, captured_by)`
- `actions(id, case_id, finding_id, action_type, status, payload_jsonb, idempotency_key, prepared_by, approved_by, sent_at)`
- `escalation_packets(id, action_id, channel, packet_jsonb, sent_reference, status)`
- `notifications(id, user_id, type, payload_jsonb, read_at, created_at)`
- `case_timeline_events(id, case_id, actor_user_id, event_type, payload_jsonb, created_at)`
- `audit_logs(id, actor_user_id, action, object_type, object_id, metadata_jsonb, prev_hash, curr_hash, created_at)`

### Índices mínimos
- `findings(case_id, status)`
- `findings(minor_id, platform)`
- `actions(finding_id, status)`
- `cases(family_id, status)`
- `audit_logs(object_type, object_id, created_at desc)`

### Controles
- FK estrictas + soft-delete solo donde aplique (`users`, `cases` no hard delete).
- Retención evidencia configurable (`evidence_retention_days`).

---

## 5) Endpoints del backend (v1)

### Auth & IAM
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `POST /v1/auth/mfa/verify`
- `GET /v1/me`

### Families / Guardians / Minors
- `POST /v1/families`
- `POST /v1/families/:id/guardians`
- `POST /v1/families/:id/minors`
- `POST /v1/minors/:id/mandates`
- `GET /v1/minors/:id`

### Cases
- `POST /v1/cases`
- `GET /v1/cases`
- `GET /v1/cases/:id`
- `PATCH /v1/cases/:id/status`
- `POST /v1/cases/:id/assign`

### Findings
- `POST /v1/cases/:id/findings`
- `GET /v1/cases/:id/findings`
- `GET /v1/findings/:id`
- `PATCH /v1/findings/:id`
- `PATCH /v1/findings/:id/status`

### Evidence Vault
- `POST /v1/findings/:id/evidence/upload-url`
- `POST /v1/findings/:id/evidence`
- `GET /v1/findings/:id/evidence`
- `GET /v1/evidence/:id/download-url`

### Actions
- `POST /v1/findings/:id/actions/own-content` (borrar/archivar/privatizar)
- `POST /v1/findings/:id/actions/friendly-request`
- `POST /v1/findings/:id/actions/escalate-platform`
- `POST /v1/findings/:id/actions/escalate-search`
- `POST /v1/findings/:id/actions/escalate-urgent`
- `PATCH /v1/actions/:id/status`

### Notifications / Audit / Metrics
- `GET /v1/notifications`
- `PATCH /v1/notifications/:id/read`
- `GET /v1/audit?objectType=&objectId=`
- `GET /v1/metrics/kpis`

---

## 6) Políticas de permisos (RBAC + ABAC)

### Reglas por rol
- `guardian`: solo casos de su familia y menores asociados.
- `operator`: solo casos asignados o explicitamente autorizados.
- `collaborator_limited`: solo acciones de hallazgos marcados `ownership_type=own_content` y sin acceso a evidencia sensible completa.
- `admin`: gestiona políticas, configuración, asignaciones y auditoría global.

### ABAC obligatorio por objeto
- Evaluar `user_id`, `family_id`, `case_assignment`, `minor_scope`, `action_type`, `finding_status`.
- Ejemplo: un `guardian` no puede leer evidencia de un `finding` si `finding.case.family_id != guardian.family_id`.

### Acciones sensibles
- `escalate_urgent`, `close_case`, `hard_delete_evidence`: requieren doble control (`operator` + `admin` o `guardian` aprobación explícita según política).

---

## 7) Backlog por fases

### Fase 0 (2 semanas) — Fundaciones
- Setup monorepo, CI/CD, auth base, RBAC/ABAC base.
- Modelos Family/Minor/Case.
- Auditoría base y logging estructurado.

### Fase 1 (3 semanas) — Núcleo cobrable
- Alta de caso + menor + mandato.
- CRUD findings + ficha detallada.
- Centro de acciones (3 escenarios completos).
- Timeline + estados de caso/hallazgo.
- Evidence vault (upload, hash, descarga segura).

### Fase 2 (2 semanas) — Operación interna
- Backoffice operador con bandeja de casos.
- SLA + recordatorios automáticos.
- Plantillas editables de solicitud amistosa/escalado.
- KPIs MVP y panel de seguimiento.

### Fase 3 (2 semanas) — Hardening
- MFA obligatorio operador/admin.
- Pentest básico + rate limiting + idempotencia completa.
- Políticas de retención/borrado programado.

---

## 8) Plan de implementación MVP (secuenciado)

1. **Semana 1**: Auth, sesiones revocables, esquema DB inicial, migraciones.
2. **Semana 2**: Families/Minors/Mandates + creación de casos.
3. **Semana 3**: Findings list + detail + estados.
4. **Semana 4**: Actions center (own/friendly/escalado) con idempotencia.
5. **Semana 5**: Evidence vault + timeline + audit hash chain.
6. **Semana 6**: Backoffice operator + asignaciones + SLA queue jobs.
7. **Semana 7**: Métricas MVP + notificaciones + UX polish responsive.
8. **Semana 8**: Seguridad final, QA end-to-end, go-live limitado.

**Riesgo crítico explícito**: sin integración real con APIs de plataformas al inicio, el flujo de "enviar" será semi-manual asistido (plantilla + registro). Esto es aceptable MVP cobrable si la trazabilidad y ejecución asistida funcionan bien.

---

## 9) Qué reutilizamos del repo actual

- Base de UI web y diseño de paneles como referencia visual.
- Concepto de inventario de hallazgos y estados visibles.
- Patrón de dashboard con alertas y métricas.
- README como punto de entrada de demo.

---

## 10) Qué eliminamos o pasamos a fase 2+

### Eliminar del core MVP
- Simulación de reconocimiento facial como eje principal.
- Mensaje de “escaneo automático total” de redes.
- Dependencia del mapa como feature central (queda opcional, no bloqueante).

### Fase 2+
- Integraciones profundas API por plataforma.
- Detección avanzada/IA como apoyo de priorización.
- Automatizaciones complejas de contacto legal.
- Multiempresa/white-label.

---

## Pantallas mínimas (implementación funcional)

1. **Login / acceso** (incluye MFA operador/admin)
2. **Onboarding de caso** (familia, menor, mandato)
3. **Dashboard familiar** (casos, pendientes, SLA)
4. **Lista de hallazgos** (filtros por estado/prioridad/plataforma)
5. **Ficha de hallazgo** (evidencia, estado, recomendación)
6. **Centro de acciones** (propio, amistosa, escalado)
7. **Seguimiento del caso** (timeline + estado global)
8. **Evidence Vault** (archivos, hashes, cadena de custodia)
9. **Backoffice operador** (bandeja, asignación, revisión)
10. **Configuración y permisos** (roles, scopes, políticas)

---

## Métricas MVP instrumentadas

- `cases_created`
- `actionable_findings_count`
- `time_to_first_action_minutes`
- `actions_executed_ratio`
- `resolved_takedown_ratio`
- `escalation_ratio`
- `mean_time_to_resolution_hours`
- `guardian_satisfaction_score`

Cada métrica se expone en `/v1/metrics/kpis` y se registra por ventana temporal (día/semana/mes).
