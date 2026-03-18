# Auditoria Tecnica (Admin) - Backend + Frontend

Fecha: 2026-03-18

Alcance de esta auditoria
- Panel Administrador (frontend `frontend/src/components/dashboard_administrador/**`).
- Backend relacionado con Admin (NestJS: `dashboard_administrador`, `lista_aprendices`, `crear_proyecto`, `ver_proyecto`, `cambios_sistema`, `asignar_proyecto`).

Objetivos
- Mejorar mantenibilidad (Clean Code, SOLID, DRY, KISS) sin cambiar funcionalidad.
- Reducir cuellos de botella de rendimiento (especialmente queries repetitivas).
- Elevar el nivel de documentacion para trabajo en equipo y despliegues productivos.
- Identificar riesgos de seguridad y proponer mitigaciones realistas.

---

## Stack (segun el repositorio)

Backend
- Node.js + NestJS
- TypeORM (DataSource + Repository) + mysql2
- BD MySQL (schema `pro_scrum`), con variaciones legacy vs modernas

Frontend
- React + TypeScript
- Vite
- UI: componentes propios + `lucide-react` (iconos)

---

## Arquitectura Actual (resumen)

Backend (NestJS)
- Organizacion por feature-module: carpeta por caso de uso (ej: `ver_proyecto`, `lista_aprendices`).
- Acceso a datos mixto:
  - `Repository<Usuario>` en algunas rutas (CRUD clasico).
  - SQL manual via `DataSource.query()` en casos donde el esquema puede variar.
- Estrategia de compatibilidad:
  - Introspeccion del esquema (`information_schema`) para detectar tablas/columnas.
  - Vistas "legacy" (`fichas`, `usuario_ficha`) cuando la BD usa tablas modernas (`ficha`, `usu_fic`).

Frontend (React)
- Pantallas admin por feature bajo `dashboard_administrador/`.
- Estado y side-effects manejados principalmente dentro de cada pantalla.
- Llamadas HTTP con `fetch()` en cada componente (manejo de errores variable).
- Sesion/roles validados por `localStorage` en el cliente.

---

## Hallazgos (FASE 1)

### Diseno, acoplamiento y cohesion
- Componentes monoliticos: `VerProyectos.tsx` concentra navegacion jerarquica, modales, CRUD, y logica de filtros.
- Contratos (DTOs) acoplados al controller: bodies tipados inline, dificulta reuso y validacion consistente.
- Duplicacion backend: `tableExists/columnExists/getTableType/ensureLegacyAdminViews` se repetian en mas de un servicio.
- Nombres/estandares mixtos: combinacion de convención legacy (columnas BD) + nombres de UI en el mismo archivo.

### Code smells tipicos detectables
- Funciones largas con multiples responsabilidades (especialmente en `VerProyectos.tsx`).
- Repeticion de patrones `fetch -> if !ok -> parse message -> throw`.
- Uso de "unknown" en respuestas DB donde puede existir un contrato claro.

### Rendimiento
- Cuello de botella: consultas repetidas a `information_schema` por request.
  - Impacto: aumenta latencia y carga de BD (especialmente en pantallas con muchas llamadas).
- Render de tablas grandes sin paginacion/virtualizacion.
  - Mitigacion actual parcial: scrolls/alturas maximas en modales.

### Seguridad (riesgos)
- Autenticacion/Autorizacion: el backend no aplica guards por rol (la validacion ocurre en el cliente via `localStorage`).
  - Riesgo: cualquier cliente podria llamar endpoints admin si conoce la URL.
- Validacion de payload:
  - Existe validacion manual en algunos casos, pero no es uniforme.
- Dependencias externas:
  - Avatares via `ui-avatars.com` (disponibilidad/privacidad).

### Observabilidad y operacion
- Logging: principalmente `console.error` en frontend y excepciones en backend, sin un formato estable.
- Contrato de errores: mensajes no estandarizados en todos los endpoints.

---

## Estrategia de mejora (FASE 2)

Principios
- Refactor incremental: cambios pequenos, verificables y sin cambiar endpoints o UX.
- Separar "compatibilidad de BD" de "logica de negocio" donde sea posible.
- Mantener query-values parametrizados (`?`) y escapar identificadores solo cuando sea necesario.

Patrones/tecnicas a aplicar
- Backend:
  - "Service + helper" (equivalente a una capa de infraestructura): `SchemaIntrospection` para compatibilidad y metadatos del esquema.
  - DTOs (a futuro): mover contratos a archivos dedicados para consistencia.
- Frontend:
  - Centralizar HTTP (a futuro): un wrapper para `fetch` + parsing de errores.
  - Dividir pantallas grandes en subcomponentes (sin cambiar UI).

Que requiere reestructuracion mayor (propuesto, no obligatorio en un solo cambio)
- Seguridad: introducir autenticacion real (JWT/sesiones) y guards por rol en NestJS.
- Separacion estricta por capas (Clean Architecture) si el proyecto crece (repositorios, casos de uso, DTOs, mappers).

---

## Cambios implementados (FASE 3-4) en este ciclo

Backend
- Se creo `SchemaIntrospection` para:
  - Consultar `information_schema` con cache.
  - Crear vistas legacy solo una vez por proceso (memoizacion).
  - Centralizar escapado seguro de identificadores.
- `DashboardService`, `ListaService` y `VerproService` delegan introspeccion del esquema a `SchemaIntrospection` (menos duplicacion, mejor performance).

Frontend (Admin)
- `VerProyectos`: mejoras UX en modales (scrolls), CRUD de HU/CA/Sugerencias, acciones por fila y orden/scroll de aprendices.

---

## Propuesta de reestructuracion (FASE 5)

Backend (propuesta)
- `src/shared/database/`:
  - `SchemaIntrospection.ts` (ya existe)
- `src/<feature>/dto/`:
  - DTOs de request/response por feature
- `src/<feature>/queries/`:
  - SQL manual centralizado (opcional) para separar queries de logica

Frontend (propuesta)
- `dashboard_administrador/api/`:
  - wrapper HTTP (`fetchJson`, `ApiError`)
- `dashboard_administrador/proyectos_admin/`:
  - `components/` (tablas, modales)
  - `hooks/` (data loading + estado)
  - `types.ts` (contratos)
  - `utils.ts` (helpers puros)

---

## Seguridad (FASE 6) - Recomendaciones para produccion

Backend
- Implementar autenticacion (JWT o sesion) y autorizacion por rol (Guards) en rutas admin.
- Validacion sistematica de DTOs (ej: `class-validator`) con reglas compatibles.
- Rate limiting basico para endpoints de login y operaciones pesadas.

Frontend
- Evitar confiar en `localStorage` como unica barrera (dejarlo solo como UX).
- Manejo consistente de errores y expiracion de sesion.

---

## Mejoras futuras (FASE 8)

- Normalizar contratos (DTOs) en `ver_proyecto` y `crear_proyecto`.
- Reducir el tamanio de `VerProyectos.tsx` extrayendo subcomponentes y hooks.
- Estandarizar respuestas de error del backend (estructura `code`, `message`, `details`).
- Agregar pruebas minimas (smoke) para endpoints admin criticos.
