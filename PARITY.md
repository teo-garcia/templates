# Template parity contract

These templates are independent repos that are meant to teach the *same* shape in
different stacks. Anything listed here must look the same everywhere it applies.
When a template deviates, either fix the template or amend this document —
silent divergence is the failure mode this file exists to prevent.

Status: **frontend reconciled (2026-08-17)**, **backend pending**.
Go backend added 2026-08-24 — see section 4b.

Note: the template directories were renamed to `<stack>-template-fullstack`
(e.g. `react-router-template-fullstack`, `next-template-fullstack`) after the
first pass; paths below use the current names.

---

## 0. Dev server port

Every frontend template serves on **port 3000** in dev and in the production
start script. No exceptions — Astro's 4321 and Angular's 4200 defaults are
overridden. Playwright `baseURL`/`webServer.url`, Docker `EXPOSE`/`PORT`,
`.env.example`, `robots.txt`, and `lib/env.ts` defaults must all agree.

Where the port is pinned per stack:

- react-router / tanstack-start — `vite.config.ts` → `server.port`
- astro — `astro.config.ts` → `server.port` (plus `site`)
- next — `package.json` → `next dev -p 3000` / `next start -p 3000`
- angular — `angular.json` → `serve.options.port`; SSR `src/server.ts` defaults to 3000

## 1. Coverage contract (all templates, frontend and backend)

This is the part most likely to drift, because every stack has its own runner.
The runner differs; the contract does not.

| Rule | Value |
| --- | --- |
| Command | `pnpm coverage` exists in every template and exits 0 |
| Provider | `v8` for Vitest, runner default for Jest |
| Reporters | `text`, `lcov`, `html` — in that order |
| Output directory | `coverage/` (gitignored) |
| Include | source directories only (`app/`, `src/`, `lib/`, `features/`, `components/`) |
| Exclude | tests and specs, `*.d.ts`, `__mocks__/`, `lib/test/`, `lib/mocks/`, generated code (`*.gen.ts`, Prisma clients), framework entrypoints (`main.ts`, `server.ts`, bootstrap files), config files |
| Thresholds | **opt-in per template**, not mandated — see below |

On thresholds (revised 2026-09-02): the original rule was "none enforced
anywhere", on the reasoning that a starter suite would fail any floor on day one.
That turned out to be wrong for half the portfolio — the Python templates already
clear 80% (`fastapi` 82.9%, `django` 84.3%) and enforce `fail_under = 80`.
Deleting a passing quality gate to match templates with weaker suites is
levelling down, so the rule is now:

- A template **may** enforce a floor when its own suite clears it. Currently
  only the Python templates do.
- No floor is imposed on a template whose starter suite cannot meet it. Nest is
  at 7.9% with a single unit test; a floor there would fail every generated
  project immediately.
- Raising a floor is a per-template decision; what stays portfolio-wide is the
  command, the provider, the reporters, the output directory and the exclusions.

Where it lives per stack:

- React (rr, astro, next, tanstack-start) — `@teo-garcia/vitest-config-shared` (`react.js`)
- Angular — `angular.json` → `test.options.coverage*` (the Angular `unit-test`
  builder owns coverage; it does not read the shared Vitest config)
- Expo — `package.json` → `jest.collectCoverageFrom` / `coverageReporters` / `coverageDirectory`
- Nest — `package.json` → `jest.collectCoverageFrom` / `coverageReporters` / `coverageDirectory`
- Go (gin) — `gotest-config-shared`. The Go toolchain has none of the three
  pieces this contract needs, so that package supplies them: it filters excluded
  files out of the profile after collection (`go test` cannot exclude anything),
  converts to LCOV (Go emits none), and owns the threshold check. `make coverage`
  writes `coverage/coverage.out`, `coverage/lcov.info`, and
  `coverage/coverage.html`.
- Adonis — `.c8rc.json` + `pnpm coverage` (c8 wrapping `node ace test`)

Go-specific rule: coverage **must** be collected with `-coverpkg=./...`. Without
it Go credits a package only for the tests declared inside it, so a layered
service whose HTTP tests drive the middleware and domain packages reports a
total far below reality (54% vs 20% measured on `gin-template-monolith`).
`-covermode=atomic` is likewise mandatory whenever `-race` is on.

## 2. Health check

Every template exposes the same health contract.

- `lib/health.ts` is byte-identical across all frontend templates: `HealthStatus`
  (`'ok' | 'degraded' | 'down'`), `HealthResponse`, `createHealthyHealthResponse()`,
  `parseHealthResponse()`.
- Exactly **one** source of health data per template. No parallel loaders, server
  functions, or duplicate routes.
- The endpoint is `/api/health`. No aliases.
- The MSW handler for `/api/health` returns `createHealthyHealthResponse()`.

### Health badge

Every page renders the same badge, with **three** states — never "render
nothing and hope":

| State | Copy | Indicator |
| --- | --- | --- |
| pending | `CHECKING` | spinning `LoaderCircle` |
| resolved | `{OK\|DEGRADED\|DOWN}` | dot, yellow-500 / green-500 / red-500 |
| failed | `UNREACHABLE` | red-500 dot |

- Rendered from a shared `health-status/` component mounted in the app shell
  (web: `layout` / root; Expo: `_layout`), so it shows on **every** page, not
  just home.
- Placement: **fixed, top-left** (`left-4 top-4 md:left-8 md:top-8`), deliberately
  opposite the theme switch's top-right corner so the two never overlap.
- Collapsed to a status dot; hovering (web) or tapping (Expo) expands the pill
  to reveal the `Copy` label. The label stays in the DOM, so screen readers
  announce state changes without requiring hover.
- Styling uses theme tokens (`border-border`, `bg-card`, `text-muted-foreground`)
  so it follows the theme switch; only the status dot uses fixed semantic colors.
- Expo uses the same copy, states, and dot colors, but its own token names
  (`bg-surface`, `border-border`, `text-foreground`) because its palette in
  `global.css` does not define `card`/`muted-foreground`.

## 2b. Theme switch

- A single icon button that **cycles** light → dark → system, fixed to the
  top-right (`right-4 top-4 md:right-8 md:top-8`), with `Sun`/`Moon`/`Laptop`
  icons and an `aria-label` naming the current mode.
- Angular matches this exactly (it previously used a three-button segmented bar
  pinned bottom-right — that was drift, now removed).
- Expo has no theme switch: it follows the OS colour scheme via `useColorScheme()`.

## 2c. Document titles and short names

- Each template's `siteMetadata.shortName` (or `APP_SHORT_NAME` on Expo) is a
  three-letter abbreviation of `<Tech> Template <Fullstack|Expo>`: `NTF`
  (next), `ATF` (astro), `ATF` (angular), `TTF` (tanstack-start), `RRF`
  (react-router), `RNT` (react-native).
- Browser titles follow the **`{shortName} | page`** format (letters first):
  `ATF | Home`, `TTF | Page not found`, `RRF | Something went wrong`. The old
  `page | {shortName}` order and stale initials (`RTN`, `RTA`, `RTTS`, `ATS`,
  `RTRR`, `RNTE`) were drift.
- Defaults: next's layout `title.default` is the short name and `title.template`
  is `{shortName} | %s`; react-router/tanstack `getSeoMeta({ title })` default
  to `siteMetadata.shortName`.

## 3. Component and file layout (React templates)

- `{app,src}/components/<name>/<name>.tsx` with `<name>.test.tsx` beside it.
  This includes `home-page/`, `health-status/`, `route-state/`, `theme-switch/`.
- The home route/page is a thin wrapper: it owns metadata/SEO and renders
  `<HomePage />`. Data fetching lives in the component, not the route.
- Hooks live in `{app,src}/lib/hooks/<name>.ts`, are exported with
  `export const`, and have a `<name>.test.ts` beside them.
- `lib/test/render.tsx` exports `render`, `renderHook`, `screen`, `waitFor`,
  `within` — all wrapped in the template's real provider tree. It builds a
  **fresh `QueryClient` per render**; a module-level shared client leaks cached
  queries between tests and produces ordering-dependent failures.
- The app shell wraps content in `<div class='min-h-screen'><main id='main-content'>`.

## 4. Route states

- `route-state.tsx` exports `RouteState`, `RouteStateLink`, `RouteStateButton`,
  `RouteLoadingState`, `RouteNotFoundState`.
- `RouteErrorState` is **Astro-only by design**: Astro's `500.astro` is a static
  page with no error object or reset callback, so it needs a preset. Templates
  with live error boundaries (rr, next, tanstack-start) compose `RouteState`
  with `variant='error'` plus a reset action instead — that is richer, not
  missing. Do not "fix" this by adding an unused preset.
- `NavigationPendingIndicator` is react-router-only (it needs `useNavigation`).

## 4b. Go template (gin-template-monolith)

Added 2026-08-24. It meets the canonical wire contract from section 6 — success
`{success: true, …, data, meta}`, failure `{success: false, …, message, error, meta}`,
list `data` of `{data, meta:{total, page, pageSize}}` — verified by curling a
running server against live Postgres and Redis.

Deliberate differences from the Nest/Adonis/Spring implementations:

- **Envelopes are applied at the call site, not by an interceptor.** Nest,
  Adonis, and Spring wrap responses in an interceptor with a path skip-list for
  `/health*`, `/metrics`, and `/docs*`. The Go template exposes
  `httpx.OK/Created/NoContent/RespondError` instead, and the operational routes
  simply do not call them. The bytes on the wire are identical; there is no
  skip-list to keep in sync. This is idiomatic Go, not drift.
- **`/docs` is a self-contained page, not Swagger UI.** Bundling Swagger UI
  would add a large asset dependency and loading it from a CDN would violate the
  no-external-runtime-dependency rule and the template's own CSP. The page
  fetches `/openapi.json` and renders it client-side.
- **The OpenAPI document is hand-built in `internal/shared/openapi`**, not
  generated from annotations by `swag`. That keeps `make build` free of a
  codegen step and — the actual reason — makes it possible to document the
  envelope via an `allOf` wrapper on every 2xx, satisfying section 6 item 3.
- **Health payload follows Nest's Terminus shape** (`{status, info, error, details}`)
  because Nest is the portfolio's backend reference. `/health` and
  `/health/ready` return the *same* status and the *same* HTTP code for the same
  failure — the Adonis split between `degraded` and `error` (section 6 item 4)
  is not reproduced here. `/health/live` never touches a dependency, so a
  database outage cannot cause a restart loop.
- **Docs paths are `/docs` + `/openapi.json`**, matching Adonis's second alias
  rather than Nest's `/docs-json`. Section 6 item 6 is still open; when it is
  settled this template moves with the others.

Contract items this template does satisfy that section 6 lists as open
elsewhere: metrics use explicit histogram buckets (so p95/p99 work) and label
`route` with the matched pattern (`/api/v1/tasks/:id`), never the raw URL, so
cardinality stays bounded — item 5's complaint about Adonis does not apply.

## 5. Known deviations, accepted

- **Astro `HealthStatus` owns its own `QueryClient`.** Astro hydrates each
  island separately, so the health island cannot read React context from the
  `Providers` island in `base.astro`. Documented in the component. Because that
  client carries production retry settings, the component also exports
  `HealthStatusContent` — the unit the test renders against the shared test
  providers, so Astro's test stays structurally identical to the others.
- **Import alias**: next uses `@/`, everything else uses `~/`. Per-template
  tsconfig, not worth unifying.
- **`vitest-config-shared/angular.js` is currently unused** — the Angular
  template configures coverage through `angular.json`. Either wire it up via the
  builder's `runnerConfig` or drop the export; do not let it rot silently.

## 6. Backend items still open (next run)

Ordered by severity. See the frontend sections above for the coverage rules that
apply equally here.

1. ~~**Adonis has no rate limiting at all.**~~ **DONE (2026-08-20).** Adonis uses
   `@adonisjs/limiter` with a Redis store (`config/limiter.ts`) plus
   `app/middleware/throttle_middleware.ts`: `THROTTLE_LIMIT` requests per
   `THROTTLE_TTL` seconds per client IP (100/60s, same env names as Nest),
   `X-RateLimit-*` headers, and a 429 in the shared error envelope with
   `Retry-After`. Skip list covers `/`, `/health*`, `/metrics`, `/docs*` plus
   Adonis-only `/swagger` and `/openapi.json`. Covered by
   `tests/functional/throttle.spec.ts`.

   Follow-up found here: `config/redis.ts` never declares the
   `@adonisjs/redis/types` module augmentation, so `RedisConnections` resolves to
   `never` and a typed `connectionName: 'main'` will not compile. Worked around
   by relying on the default connection; the augmentation is still missing.

2. ~~**Success envelope drift.**~~ **DONE (2026-08-21).** Resolved in favour of
   keeping the envelope. Adonis wraps successful responses via
   `app/middleware/response_envelope_middleware.ts` in
   `{success, statusCode, timestamp, path, method, data, meta}` with
   `meta.{requestId, version, duration}`, matching Nest's `TransformInterceptor`.
   Skips `/metrics` and `/health*` as Nest does, plus `/docs*`, `/swagger`,
   `/openapi.json`; leaves 204 and any status >= 400 alone so the error envelope
   still comes from `app/exceptions/handler.ts`.

   **Canonical wire format for every backend template:** success →
   `{success: true, …, data, meta}`; failure →
   `{success: false, …, message, error, meta}`.

3. ~~**Nest's OpenAPI is wrong because of (2)**~~ **DONE (2026-08-21).** Both
   templates now document the wrapper rather than the inner payload:

   - Adonis — `SuccessEnvelope` schema plus an `allOf` wrapper applied to every
     2xx response in `app/services/openapi_schema_service.ts`.
   - Nest — `SuccessEnvelopeDto` and a reusable `ApiEnvelopeResponse(type)`
     decorator in `src/shared/dto/`, applied across `tasks.controller.ts` and the
     previously undocumented root endpoint (`AppInfoDto`). 204 responses stay
     body-less and are documented with `ApiNoContentResponse`.

   Verified by curling a running server and diffing the payload against
   `/docs-json`; asserted in `test/app.e2e-spec.ts`.
4. ~~**Health payload shape.**~~ **DONE (2026-09-01).** All **six** backends now
   answer in the same contract the frontend templates already use
   (`lib/health.ts`), rather than any one framework's health output:

   ```json
   { "status": "ok|degraded|down", "timestamp": "...", "version": "1",
     "checks": { "database": "up|down", "redis": "up|down" } }
   ```

   - Aggregation: every check up -> `ok`, some up -> `degraded`, none up ->
     `down`. HTTP 200 when `ok`, otherwise 503 so orchestrators drain the
     instance.
   - `/health/live` is liveness only -- it returns **no** `checks`, so a slow
     dependency can never trigger a container restart.
   - `/health` and `/health/ready` return the identical report. Reporting
     `degraded` on one and `error` on the other for the same failure was drift;
     it existed in Adonis, FastAPI and Django and is now gone from all three.
   - `checks` reports exactly the dependencies every template shares
     (`database`, `redis`). Spring contributes seven Actuator components
     (`diskSpace`, `ssl`, `livenessState`, ...); only the shared two are
     surfaced, so `checks.database` means the same thing everywhere and a full
     disk cannot degrade one template but not the others.

   Per template:

   | Template | Where | Framework shape replaced |
   | --- | --- | --- |
   | Nest | `src/shared/health/health.contract.ts` + `health.service.ts` | Terminus `{info, error, details}` (**`@nestjs/terminus` removed**) |
   | Adonis | `app/services/readiness_service.ts` | ad-hoc `{checks, status}` |
   | Gin | `internal/shared/health/health.go` | Terminus-style `{info, error, details}` |
   | Spring | `shared/health/HealthController.java` | Actuator `HealthDescriptor` |
   | FastAPI | `app/shared/health/router.py` | ad-hoc `{status, checks}` |
   | Django | `app/shared/health/views.py` | ad-hoc `{status, checks}` |

   Verified by curling every running server, not just by tests. Note Spring's
   `make check` passes against sources while `make start` runs `target/*.jar` --
   a stale jar served the old payload until rebuilt, so always `make build`
   before curling that one.

4b. ~~**Success envelope absent in FastAPI and Django.**~~ **DONE (2026-09-02).**
   Both Python backends returned raw payloads on success while every other
   template wrapped them; they only had the error envelope. Both now ship
   `app/shared/middleware/response_envelope.py` producing the canonical
   `{success, statusCode, timestamp, path, method, data, meta}` with
   `meta.duration` in whole milliseconds, and both rewrite their OpenAPI in the
   same pass (`app/shared/openapi/envelope.py`) so 2xx schemas are an `allOf`
   against a `SuccessEnvelope` component rather than the bare payload.

   With this, **all six backends** emit both envelopes identically. Verified by
   curling each running server.

5. **Metrics.** Nest uses `prom-client` with histogram buckets and default
   process metrics; Adonis hand-rolls counters with no buckets (so no p95/p99)
   and falls back to a raw URL label on unmatched routes (unbounded cardinality).
6. ~~**Docs paths.**~~ **DONE (2026-09-02).** Every backend serves exactly
   `/docs` (UI) and `/openapi.json` (spec). Nest moved off Swagger's default
   `/docs-json` via `jsonDocumentUrl`; Adonis dropped its duplicate `/swagger`
   route and points its UI at `/openapi.json`. FastAPI additionally serves
   `/redoc`, which is an accepted extra rather than drift.
7. **Coverage.** Adonis has no `coverage` script; Nest's `collectCoverageFrom`
   is `src/**/*.(t|j)s`, which sweeps in the generated Prisma client.
