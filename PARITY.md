# Template parity contract

These templates are independent repos that are meant to teach the *same* shape in
different stacks. Anything listed here must look the same everywhere it applies.
When a template deviates, either fix the template or amend this document —
silent divergence is the failure mode this file exists to prevent.

Status: **frontend reconciled (2026-08-17)**, **backend pending**.

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
| Thresholds | **none enforced** — deliberate |

Why no thresholds: a template ships a starter suite, so any floor would fail
every project generated from it on day one. If a floor is ever wanted, it has to
be added to every template in the same change, not one at a time.

Where it lives per stack:

- React (rr, astro, next, tanstack-start) — `@teo-garcia/vitest-config-shared` (`react.js`)
- Angular — `angular.json` → `test.options.coverage*` (the Angular `unit-test`
  builder owns coverage; it does not read the shared Vitest config)
- Expo — `package.json` → `jest.collectCoverageFrom` / `coverageReporters` / `coverageDirectory`
- Nest — `package.json` → `jest.collectCoverageFrom` / `coverageReporters` / `coverageDirectory`
- Adonis — **not yet implemented** (no `coverage` script at all)

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

1. **Adonis has no rate limiting at all.** Nest has `ThrottlerGuard` + Redis
   storage + `setHeaders` + a skip list for `/health`, `/metrics`, `/docs`.
2. **Success envelope drift.** Nest wraps every non-health/metrics response in
   `{success, statusCode, timestamp, path, method, data, meta}`; Adonis returns
   raw payloads. Error envelopes already match.
3. **Nest's OpenAPI is wrong because of (2)** — it documents the inner DTO while
   the wire format is the envelope.
4. **Health payload shape.** Nest returns Terminus `{status, info, error, details}`;
   Adonis returns `{checks, status}`, and reports `degraded` on `/health` but
   `error` on `/health/ready` for the same failure.
5. **Metrics.** Nest uses `prom-client` with histogram buckets and default
   process metrics; Adonis hand-rolls counters with no buckets (so no p95/p99)
   and falls back to a raw URL label on unmatched routes (unbounded cardinality).
6. **Docs paths.** Nest: `/docs` + `/docs-json`. Adonis: `/docs` + `/swagger` +
   `/openapi.json`.
7. **Coverage.** Adonis has no `coverage` script; Nest's `collectCoverageFrom`
   is `src/**/*.(t|j)s`, which sweeps in the generated Prisma client.
