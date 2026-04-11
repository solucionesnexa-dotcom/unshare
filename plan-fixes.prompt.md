# Plan: Arreglar 14 Fallos Críticos del Codebase

## TL;DR
Hay 1 fallo **CRÍTICO** (conflicto merge) que bloquea compilación, 3 fallos **ALTO**, 7 **MEDIANO** y 3 **BAJO**. El plan resuelve en 4 fases secuenciales, priorizando por impacto: primero desbloquear compilación, luego seguridad de tipos, luego autorización, finalmente mejoras menores.

## Fases de Implementación

### Fase 1: Desbloquear Compilación (CRÍTICO)
**Depende de:** Ninguno | **Bloquea:** Todas las otras fases

1. **Resolver conflicto merge en audit.service.ts**
   - Archivo: `apps/api/src/modules/audit/audit.service.ts`
   - Acción: Resolver conflicto (`HEAD` usa `Prisma.InputJsonValue`, rama alternativa usa `{}`)
   - Decisión: Mantener HEAD (es más correcto tipado para JSON)
   - Cambios específicos:
     - Eliminar marcas de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`)
     - Mantener import `import { Prisma } from '@prisma/client';`
     - Usar `metadata: (event.metadata ?? {}) as Prisma.InputJsonValue,`

---

### Fase 2: Remover Type Casting Inseguro (ALTO)
**Depende de:** Fase 1 | **Parallelizable:** Sí (son independientes)

2. **Remover `as any` en evidence.service.ts línea 22**
   - Archivo: `apps/api/src/modules/evidence/evidence.service.ts`
   - Cambio: `const finding = (await this.findingsService.getById(user, findingId)) as any;`
   - Hacia: `const finding = await this.findingsService.getById(user, findingId);`
   - Justificación: `FindingsService.getById()` ya retorna tipo correcto

3. **Remover `as any` en actions.service.ts línea 23**
   - Archivo: `apps/api/src/modules/actions/actions.service.ts`
   - Cambio: `const finding = (await this.findingsService.getById(user, findingId)) as any;`
   - Hacia: `const finding = await this.findingsService.getById(user, findingId);`
   - Justificación: Mismo patrón que #2

---

### Fase 3: Seguridad de Autorización (ALTO)
**Depende de:** Fase 1 | **Parallelizable:** Sí (son independientes)

4. **Agregar `@PolicyResource()` a 4 controladores**
   - actions.controller.ts: Agregar `@PolicyResource('action')` sobre métodos protegidos
   - cases.controller.ts: Agregar `@PolicyResource('case')` sobre métodos protegidos
   - evidence.controller.ts: Agregar `@PolicyResource('evidence')` sobre métodos protegidos
   - findings.controller.ts: Agregar `@PolicyResource('finding')` sobre métodos protegidos
   - Ejemplo de cambio:
     ```
     @Post('findings/:findingId/evidence/upload-url')
     @PolicyResource('evidence')  // ← AGREGAR ESTA LÍNEA
     async createUpload(...) { ... }
     ```
   - Impacto: Sin esto, el PolicyGuard no sabrá qué tipo de recurso validar

---

### Fase 4: Mejoras de Consistencia y Completitud (MEDIANO + BAJO)
**Depende de:** Fase 1

#### 4a. Métodos Async en Auth Controller (MEDIANO)
- Archivo: `apps/api/src/modules/auth/auth.controller.ts`
- Cambios en líneas 13, 16, 19:
  - `login()` → `async login()`
  - `refresh()` → `async refresh()`
  - `logout()` → `async logout()`
- Justificación: Retornan Promises implícitamente; ser explícito mejora legibilidad

#### 4b. Agregar `@async` a evidence.controller.ts línea 19 (MEDIANO)
- Archivo: `apps/api/src/modules/evidence/evidence.controller.ts`
- Cambio: `completeUpload(...)` → `async completeUpload(...)`
- Justificación: Retorna Promise de `markUploaded()`

#### 4c. Crear DTO formal para completeUpload (MEDIANO)
- Nueva clase: `apps/api/src/modules/evidence/dto/mark-uploaded.dto.ts`
- Contenido:
  ```typescript
  import { IsString, IsOptional } from 'class-validator';
  
  export class MarkUploadedDto {
    @IsString()
    evidenceId: string;
  
    @IsString()
    sha256: string;
  
    @IsString()
    @IsOptional()
    mimeType?: string;
  }
  ```
- Usar en controller: `@Body() body: MarkUploadedDto`

#### 4d. Sincronizar ActionType enum (MEDIANO)
- Primero: Verificar schema.prisma para ActionType enum (líneas actuales)
- Actualizar DTO: `apps/api/src/modules/actions/dto/create-action.dto.ts`
- Incluir todos los tipos del enum en validación

#### 4e. Implementar Procesadores BullMQ (ALTO - desplazado aquí por complejidad)
- 4 archivos stub en `apps/api/src/jobs/processors/`:
  - `notifications.processor.ts`
  - `sla-reminder.processor.ts`
  - `action-followup.processor.ts`
  - `retention-purge.processor.ts`
- Acción: Reemplazar `return { ok: true, id: job.id };` con lógica real
- Nota: Requiere definición de negocio (fuera de alcance actual - marcar como TODO con comentarios)

#### 4f. Validación Cruzada en CreateFindingDto (MEDIANO - Seguridad)
- Archivo: `apps/api/src/modules/findings/dto/create-finding.dto.ts`
- Agregar validator personalizado en `FindingsService.create()` (línea ~15):
  ```
  // Verificar que el minorId pertenece a la familia del usuario
  const minor = await this.prisma.minor.findFirst({
    where: { id: dto.minorId, family: { id: user.familyId } }
  });
  if (!minor) throw new BadRequestException('Minor not in user family');
  ```

#### 4g. Non-null Assertion Segura (BAJO)
- Archivo: `apps/api/src/modules/auth/auth.service.ts` línea 72
- Cambio: Reemplazar `r.scopeId!` con validación:
  ```typescript
  .filter(r => r.scopeId !== null)
  .map(r => r.scopeId as string)
  ```

#### 4h. Deprecación TypeScript baseUrl (BAJO)
- Archivo: `apps/api/tsconfig.json` línea 12
- Opción A: Agregar ignoreDeprecations: `"ignoreDeprecations": "6.0"`
- Opción B (mejor): Remover `baseUrl` y usar paths configurados
- Recomendación: Opción B (futuro-proof)

#### 4i. Manejo de Errores en Seed (BAJO)
- Archivo: `apps/api/prisma/seed.ts`
- Cambio: Reemplazar `.catch(() => undefined)` con `.catch(err => { console.warn('Seed warning:', err); })`
- Justificación: Debugging más fácil

---

## Archivos a Modificar (Resumen)

| Fase | Archivo | Líneas | Acción |
|------|---------|--------|--------|
| 1 | `audit.service.ts` | 5, 44-45 | Resolver merge conflict |
| 2 | `evidence.service.ts` | 22 | Remover `as any` |
| 2 | `actions.service.ts` | 23 | Remover `as any` |
| 3 | `actions.controller.ts` | múltiples | Agregar `@PolicyResource('action')` |
| 3 | `cases.controller.ts` | múltiples | Agregar `@PolicyResource('case')` |
| 3 | `evidence.controller.ts` | múltiples | Agregar `@PolicyResource('evidence')` |
| 3 | `findings.controller.ts` | múltiples | Agregar `@PolicyResource('finding')` |
| 4a | `auth.controller.ts` | 13, 16, 19 | Agregar `async` |
| 4b | `evidence.controller.ts` | 19 | Agregar `async` |
| 4c | `mark-uploaded.dto.ts` | NEW | Crear DTO |
| 4d | `create-action.dto.ts` | múltiples | Sincronizar enums |
| 4e | 4 processors | múltiples | Implementar lógica (TODO) |
| 4f | `findings.service.ts` | ~15 | Agregar validación |
| 4g | `auth.service.ts` | 72 | Hacer safe null check |
| 4h | `tsconfig.json` | 12 | Remover baseUrl |
| 4i | `seed.ts` | múltiples | Mejorar error handling |

---

## Verificación (Pass/Fail Criteria)

### Fase 1 - Compilación
- [ ] `npm run build` en `apps/api/` ejecuta sin errores
- [ ] Sin marcas de conflicto merge en ningún archivo

### Fase 2 - Type Safety
- [ ] `npx tsc --noEmit` no reporta type errors (0 errors)
- [ ] ESLint no reporta `as any` violations

### Fase 3 - Autorización
- [ ] `npm run lint` no reporta warnings de decoradores faltantes
- [ ] PolicyGuard.canActivate() puede acceder a `req.policyResource` en todos los endpoints protegidos

### Fase 4 - Completitud
- [ ] Todos los archivos DTO cumplen con class-validator
- [ ] Tests e2e pasan sin warnings
- [ ] Linters (ESLint, Prettier) pasan 100%

---

## Decisiones

1. **Resolver merge conflict con HEAD** — HEAD usa Prisma typing, es más seguro
2. **Mantener fixtures stubs en processors** — Se marcarán como TODO ya que requieren definición de negocio
3. **Usar DTO pattern** — Consistente con resto del codebase
4. **Remover baseUrl** — En lugar de ignorar deprecation, preparar para TS 7.0
5. **Validación cruzada en service, no en DTO** — DTOs validan forma, service valida permisos

---

## Notas de Ejecución

- Fases 1 y 2 son **prerequisitos** para Fase 3 (no pueden ejecutarse en paralelo)
- Fase 4 items son **independientes** y pueden ejecutarse en cualquier orden tras Fase 1
- Plan asume acceso a archivos del repo para lectura/escritura
- Estimado: ~45 min ejecución manual, ~10 min con herramientas de edición
