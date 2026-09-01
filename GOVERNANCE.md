# Templates Governance

Single source of truth for the `@teo-garcia` templates ecosystem.
This document is the portfolio control layer: it defines what we build, what we avoid, and how we evolve without tech drift.

## Document Meta

- Version: `3.48`
- Last updated: `2026-08-24`
- Owner: `@teo-garcia`

## Leadership Intent

The goal is not to maximize feature count. The goal is to maximize:

- Delivery speed for new projects.
- Operational predictability across repos.
- Low cognitive overhead for contributors.
- Long-term maintainability of the template portfolio.

Templates are productized internal standards, not experimental playgrounds.

## Principle Layers

Each template decision must fit the layer it belongs to. Lower layers constrain higher layers; higher layers must not rewrite lower-layer rules casually.

### Language Layer

- Language runtimes, package managers, lockfiles, type-checking, linting, formatting, and test runners are language-layer concerns.
- Keep language defaults stable and boring: TypeScript uses strict mode, pnpm, shared TS config, ESLint, Prettier, Vitest where applicable; Python uses Python 3.12+, uv, Ruff, mypy, pytest, and shared Python config packages.
- Shared packages are allowed for tooling and configuration. Runtime hooks, components, utilities, and test helpers stay local until reuse pressure is proven.
- Language-layer changes require governance when they alter runtime versions, package managers, type systems, test runners, or shared config contracts.

### Architecture Layer

- Architecture defines service boundaries, data ownership, API contracts, async contracts, observability, auth, deployment shape, and operational failure modes.
- Keep architecture explicit and composable: one-command local dev, clear contracts, health/readiness, metrics, traces, logs, graceful shutdown, migration safety, and reversible deployment paths.
- Standardize architecture before framework-specific implementation. Framework templates adapt the architecture; they do not invent incompatible local contracts.
- Architecture-layer changes require governance when they add or change persistence, brokers, service-to-service communication, auth, secrets, deployment assumptions, or public API behavior.

### Framework Layer

- Framework templates should feel native to their framework while preserving portfolio contracts.
- Framework-specific structure, routing, docs generation, dependency injection, migrations, tests, and build tooling belong here.
- Framework conventions may differ, but externally visible behavior must stay aligned within the lane: scripts, Docker shape, health, docs, metrics, errors, logging, tracing, and validation.
- Framework-layer changes require governance when they add a new framework family, break lane contracts, or make one framework diverge from shared portfolio behavior.

### Layer Ownership Map

- Language-layer rules live in **General Standards** and **Language & Runtime Notes**.
- Architecture-layer rules live in **Portfolio Fundamentals**, backend runtime defaults, migration safety, Docker, observability, and microservice management baseline.
- Framework-layer rules live in **Standards by Lane**.
- Open board items must state the layer they affect through their `Track` and `Scope`; if an item cuts across layers, the architecture layer owns the integration contract.

### Baseline Coverage Matrix

This document must answer three questions for every governed repo:

1. What every repo in the language family must have.
2. What every repo in the architecture family must have.
3. What the framework-specific template must add without breaking the shared contracts.

Governance principles reflect implemented portfolio work. When a principle describes a target that is not implemented yet, the gap must stay visible in the open board until the matching template work lands.

| Layer | Applies To | Required Baseline |
| ----- | ---------- | ----------------- |
| Language | Every Node.js / TypeScript repo | `pnpm`, strict TypeScript where applicable, shared TS config package, ESLint shared config, Prettier shared config, Vitest shared config where tests are TypeScript-native, stable scripts, lockfile, CI-friendly `check`, no runtime shared package dependency unless governed. |
| Language | Every Python repo | Python 3.12+, `uv`, Ruff shared config, mypy shared config, pytest shared config, lockfile, CI-friendly `check`, typed settings where applicable, no runtime shared package dependency unless governed. |
| Language | Every Go repo | Go 1.25+, Go modules with committed `go.sum`, `golangci-config-shared` for lint **and** format, `gotest-config-shared` for test and coverage, `Makefile` script surface, CI-friendly `check`, no runtime shared package dependency unless governed. |
| Architecture | Every app template | One-command dev, one-command check, Docker + Compose, env validation, README with local/prod flow, health surface where applicable, production build/start path, and no host-only service dependencies. |
| Architecture | Every backend monolith | REST API under `/api/v1`, OpenAPI docs, standard error envelope, request IDs, structured JSON logs, metrics, traces, CORS from env, security headers, rate limits, graceful shutdown, database migrations, rollback posture, and production-like Docker entrypoint. |
| Architecture | Every backend microservice | The monolith operational baseline where it still fits, plus bounded service ownership, `microservices-template-stack` orchestration, NATS JetStream eventing, CloudEvents-style envelope, OpenAPI-generated HTTP clients, service-to-service auth, contract tests, broker/downstream readiness, trace propagation, and Helm delivery values. Remaining work lives in GOV-078 through GOV-087 and GOV-099. |
| Architecture | Every frontend app | Build/start/check scripts, typed env contract, API URL strategy, production build artifact, health sample where applicable, and framework-native deployment docs. Frontend env promotion gaps stay open under GOV-097. |
| Architecture | Every mobile app | Expo-native dev/build/check flow, typed env contract, alias ownership, EAS/update/release-channel posture, crash reporting decision, and native release documentation. Remaining Expo release and alias work stays open under GOV-062 and GOV-069. |
| Architecture | Every CLI app | Layered command/application/domain structure, `--help`, deterministic errors, tests, JSON/progress output decision, and config file conventions. Planned CLI gaps stay open under GOV-013, GOV-014, and GOV-034. |
| Framework | React web templates | Framework-native routing/rendering conventions, shared Node/TypeScript tooling, local runtime primitives, no `react-shared`, no shared hooks/components/utilities package, and consistent frontend env rules. |
| Framework | Angular web templates | Angular 19+ standalone components, signals-first posture, `@angular/ssr` where SSR applies, shared Node/TypeScript tooling through `eslint-config-shared/angular`, `tsconfig-shared/angular`, and `vitest-config-shared/angular`, local services/components/utilities, no `angular-shared`, and consistent frontend env rules. GOV-103 is complete; `angular-template-fullstack` v1 scaffold is implemented locally under GOV-104. |
| Framework | React Native / Expo | Expo-native scripts, Metro/TypeScript/Babel alias agreement, EAS profile decision, update/release-channel decision, local components/hooks/utilities, and no `react-native-shared`. |
| Framework | NestJS backend | Module-per-domain structure, guards/interceptors/filters, DTO validation, global exception filter, Jest/Supertest, Nest config validation, and standard backend API behavior. |
| Framework | FastAPI backend | Module-per-domain structure, Pydantic settings/schemas, FastAPI `Depends()` boundaries, async-safe HTTP clients, lifespan startup/shutdown, pytest/pytest-asyncio, Alembic where persistence exists, and standard backend API behavior. |
| Framework | Django backend | Django Ninja typed API, Django ORM/migrations, pytest-django, `/docs` OpenAPI route or redirect, Django-native settings validation, and standard backend API behavior. |
| Framework | AdonisJS backend | AdonisJS 7 runtime, `@adonisjs/tsconfig` instead of `tsconfig-shared`, Lucid ORM/migrations, VineJS validation, Japa tests, adonis-autoswagger OpenAPI docs, Adonis provider boundaries through `adonisrc.ts`, hot-hook HMR, and standard backend API behavior. |
| Framework | Spring Boot backend | Spring Boot 4.1 Java 25 LTS API with controller/service/repository layers, Bean Validation, Flyway, JPA/Hibernate, Actuator health, springdoc OpenAPI, Micrometer Prometheus + OTel tracing, and standard backend API behavior. |

## Technology Control Policy

### Allowed by Default

- Technologies already represented in active templates.
- Tooling that reduces variance across templates (linting, formatting, test orchestration, CI checks).
- Additions with clear migration path and clear maintenance owner.

### Requires Governance Update First

- New framework families.
- New runtime/language baselines.
- New testing stack choices.
- New deploy/runtime assumptions that change template contracts.

## Decision Rights

- Final portfolio decisions: `Owner`.
- Proposals are welcome from any contributor.
- No template-level tech addition is considered accepted until this file is updated.
- In conflicts, governance takes precedence over individual repo README/docs.

This governance applies to active, planned, and incubating templates listed in this file.

## Technology Lanes

- **Frontend/Fullstack**: Next.js, React Router, TanStack Start, Astro, and Angular full-stack templates, plus shared config packages.
- **Backend API**: Nest templates (`monolith`, `microservice`), FastAPI templates (`fastapi-template-monolith`, `fastapi-template-microservice`), Django templates (`django-template-monolith`, `django-template-microservice`), AdonisJS templates (`adonis-template-monolith`, `adonis-template-microservice`), Spring Boot templates (`spring-template-monolith`, `spring-template-microservice`), Gin templates (`gin-template-monolith`).
- **CLI**: Click templates (`click-template-layered`), Commander templates (`commander-template-layered`).
- **Mobile**: Expo templates (`expo-template-mobile`).
- **Shared Config Packages**: TypeScript config packages (`eslint-config-shared`, `prettier-config-shared`, `tsconfig-shared`, `vitest-config-shared`) Python config packages (`ruff-config-shared`, `mypy-config-shared`, `pytest-config-shared`), and Go config packages (`golangci-config-shared`, `gotest-config-shared`). Angular consumers use the shared `./angular` exports. Runtime hooks, components, utilities, and test helpers stay in the consuming template.
- **DevOps / Platform**: shared infrastructure and operations templates that span app repos. `microservices-template-stack` is active for local backend microservice orchestration. `observability-template-stack` is active for local backend metrics, logs, traces, dashboards, and alert examples. Terraform and Helm remain incubating until their contracts are locked. App repos still own app-specific Dockerfiles, CI, and instrumentation overlays.

Each lane keeps an internal family resemblance (scripts, docs shape, testing baseline) while avoiding cross-lane coupling unless required.

## Principle Rule Breaks

- GOV-101: `adonis-template-monolith` uses AdonisJS 7 in package metadata and badges, but its README feature table still says AdonisJS 6. This breaks the documentation rule that READMEs must match real template facts.
- GOV-108: main-branch governance is not mechanically enforced across the portfolio. Only `next-template-fullstack` and `react-router-template-fullstack` have branch protection, and those rules do not require pull requests, reviews, or status checks and still allow force pushes. Existing rulesets in seven other repos are disabled.
- GOV-109: security workflows do not consistently match the documented security baseline. High-severity dependency audits are non-blocking in multiple Node.js repos, most workflows omit explicit least-privilege permissions, action references use mutable tags, and secret scanning is not consistently enabled.
- GOV-110: lifecycle state is not synchronized with GitHub. Repositories classified as archived remain active remotely and continue to receive Renovate pull requests, while several active starters are not marked as GitHub template repositories.
- GOV-111: active-repo completeness is inconsistent. `fastapi-template-microservice` has no CI, security, or Docker-build workflows; `microservices-template-stack` has no CI; and `astro-template-fullstack` is missing the required `.dockerignore`.

## Portfolio Map

### Active

- `adonis-template-monolith`
- `next-template-fullstack`
- `react-router-template-fullstack`
- `astro-template-fullstack`
- `nest-template-monolith`
- `nest-template-microservice`
- `eslint-config-shared`
- `prettier-config-shared`
- `tsconfig-shared`
- `vitest-config-shared`
- `fastapi-template-monolith`
- `fastapi-template-microservice`
- `django-template-monolith`
- `spring-template-monolith`
- `spring-template-microservice`
- `gin-template-monolith`
- `golangci-config-shared`
- `gotest-config-shared`
- `expo-template-mobile`
- `tanstack-template-fullstack`
- `ruff-config-shared`
- `mypy-config-shared`
- `pytest-config-shared`
- `microservices-template-stack`
- `observability-template-stack`

### Planned

- `angular-template-fullstack` — Angular full-stack web template with `@angular/ssr`; portfolio reference parity target is `next-template-fullstack`. See GOV-104.
- `django-template-microservice`
- `adonis-template-microservice`
- `gin-template-microservice`
- `click-template-layered`
- `commander-template-layered`

### Incubating

- `terraform-template-baseline` — cross-project IaC baseline (VPC, DNS, IAM, storage). See GOV-048.
- `helm-template-baseline` — base Helm chart for deploying app template services to Kubernetes. See GOV-049.

### Archived

- `archived/react-shared` — frozen React runtime primitives kept for reference while consumers own needed primitives locally.
- `archived/react-native-shared` — frozen React Native runtime primitives; not approved for new work.
- `archived/ts-core` — frozen TypeScript runtime utilities; pure utilities stay consumer-local unless reuse pressure justifies reopening the policy.
- `archived/python-core` — frozen Python runtime utilities; Python templates consume shared config packages only.

## Current Open Work Snapshot

The portfolio repository and submodule structure were verified locally and
against public GitHub remotes on `2026-08-21`. The broader GitHub settings
snapshot remains from `2026-07-20`.

- Open board totals: `31 Todo`, `1 In Progress`, `3 Blocked`, `2 Incubating`.
- Completed governance items are intentionally not listed on the board. Their decisions live in the fundamentals, lane standards, runtime defaults, and change-control rules below.
- The active execution focus is the backend microservice track: GOV-078 is in progress for a framework-neutral generated HTTP client rule.
- Portfolio maintenance is the next cross-cutting priority: GOV-059 and GOV-107 through GOV-115 must reduce drift and make existing policy enforceable before adding more active template families or platform layers.
- GOV-038 is complete: `fastapi-template-microservice` has been restored as an active scaffold, narrowed from the FastAPI monolith baseline into a bounded microservice, wired to NATS JetStream in standalone and stack Compose, and covered by local NATS contract tests plus stack interop smoke.
- GOV-077 is complete for the active NestJS/FastAPI microservice pair: the stack has NATS JetStream contract verification, FastAPI and Nest both expose NATS readiness, FastAPI has a governed `nats-py` boundary, and the stack-owned interop smoke proves FastAPI-to-Nest and Nest-to-FastAPI envelope exchange. Template app code still does not claim sample business publisher/consumer behavior.
- GOV-078 is still in progress: generic templates must expose accurate OpenAPI documents and may document framework-neutral generated-client expectations, but they must not contain clients, wrappers, scripts, env vars, or app code for a concrete peer template. Concrete NestJS/FastAPI client-generation proof belongs in `microservices-template-stack` or in real service repos with real upstream contracts.
- GOV-100 is complete: `nest-template-microservice` uses the governed NATS JetStream messaging boundary, readiness checks NATS, and task-specific publisher/consumer sample behavior has been removed from the template app.
- GOV-101 is a documentation drift cleanup, not a blocker for the microservice track.
- GOV-102 is complete for governance policy: the Angular web template family is accepted as a planned Frontend/Fullstack direction. GOV-103 shared config exports are complete. `angular-template-fullstack` v1 scaffold is implemented locally; remote publication remains deferred.
- Planned repos are accepted directions, not active compliance targets until scaffolded.

## Template Lifecycle

- `Active`: supported, documented, and expected to pass CI.
- `Planned`: accepted direction; not scaffolded yet. Planned repos are exempt from active CI, Docker, security, and script gates until their scaffold board item moves to `In Progress`.
- `Incubating`: candidate direction; design is not locked.
- `Archived`: frozen historical reference; no new consumers or feature work.
- `Deprecated`: frozen for migration only.

## Decision Guide

| Use Case                            | Template                                  |
| ----------------------------------- | ----------------------------------------- |
| Fullstack Astro SSR + React islands | `astro-template-fullstack`                |
| Fullstack Next.js SSR or App Router | `next-template-fullstack`                 |
| Fullstack React Router + Vite       | `react-router-template-fullstack`         |
| Fullstack TanStack Start + Vite SSR | `tanstack-template-fullstack`             |
| Fullstack Angular SSR               | `angular-template-fullstack`              |
| AdonisJS single service API         | `adonis-template-monolith`                |
| AdonisJS microservice API           | `adonis-template-microservice` (planned)  |
| NestJS single service REST API      | `nest-template-monolith`                  |
| NestJS messaging-first service      | `nest-template-microservice`              |
| Spring Boot single service API      | `spring-template-monolith`                |
| Spring Boot messaging-first service | `spring-template-microservice`            |
| Gin single service API              | `gin-template-monolith`                   |
| Gin microservice API                | `gin-template-microservice` (planned)     |
| Click CLI with Layered pattern      | `click-template-layered` (planned)        |
| Commander CLI with Layered pattern  | `commander-template-layered` (planned)    |
| FastAPI single service API          | `fastapi-template-monolith`               |
| FastAPI microservice API            | `fastapi-template-microservice`           |
| Django single service API           | `django-template-monolith`                |
| Django microservice API             | `django-template-microservice` (planned)  |
| Shared ESLint config                | `eslint-config-shared`                    |
| Shared Prettier config              | `prettier-config-shared`                  |
| Shared TSConfig config              | `tsconfig-shared`                         |
| Shared Vitest config                | `vitest-config-shared`                    |
| Shared Python lint + format config  | `ruff-config-shared`                      |
| Shared Python type-check config     | `mypy-config-shared`                      |
| Shared Python test + coverage config | `pytest-config-shared`                   |
| Shared Go lint + format config      | `golangci-config-shared`                  |
| Shared Go test + coverage config    | `gotest-config-shared`                    |
| Local backend microservices stack   | `microservices-template-stack`            |
| Local backend observability stack   | `observability-template-stack`            |

---

## Portfolio Fundamentals

Every active app template must satisfy all of the following, regardless of lane.

### Developer Experience

- One-command dev start (`dev` or equivalent).
- One-command full check pipeline: lint + typecheck + test.
- First successful local run in under five minutes on a typical machine.
- All dev dependencies containerized or clearly isolated — no "it works on my machine" gaps.

### Scripts

Minimum script surface for all app templates:

- `dev` — local development server or watcher.
- `build` — production artifact.
- `start` — run the production artifact.
- `lint:es` / `lint:es:check`
- `lint:ts` (TypeScript) or `lint:types` (Python: mypy/pyright).
- `format` / `format:check`
- `test`
- `check` — runs lint + typecheck + test in sequence (single CI gate command).

For templates with persistence:

- `db:generate`
- `db:migrate`
- `db:deploy`

### Docker

Docker is **required** for all app templates. No exception.

- `docker-compose.yml` at repo root covering all services needed for local dev.
- `docker/Dockerfile` (production-grade, multi-stage) and `docker/Dockerfile.dev` for local development.
- `.dockerignore` present and correct.
- All external dependencies (DB, cache, broker) run via Compose — never assumed to be pre-installed on host.
- `docker-compose.override.yml` pattern allowed for local-only overrides; never commit secrets in Compose files.
- Services must bind ports from env vars, not hardcoded values.
- A `docker:dev` script (or equivalent) must bring the full stack up in one command.

### Environment

- Single canonical `.env.example` at repo root, grouped and annotated by environment sensitivity where a template has staging or production concerns.
- No hardcoded secrets anywhere.
- All variables validated at startup (fail fast).
- Infra-only vars clearly commented as such.
- `.env` in `.gitignore`; `.env.example` committed.
- Backend app templates include an environment promotion checklist covering variable review per environment.

### Documentation

- `README.md`: install → env setup → dev start → test → build/deploy. Nothing else.
- Governance and portfolio decisions live only in this file.
- All script references in README must match real `package.json` / `pyproject.toml` scripts.

### Repository Governance

- Issue + PR templates under `.github/` are required for active app templates and any repo that expects issue intake.
- Lightweight public-repo governance docs (`CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS`, `CODE_OF_CONDUCT.md`) are recommended when there is a concrete contribution/support need, but are not the default gating criterion for portfolio completeness.

---

## General Standards

Cross-cutting practices that apply to every active template regardless of lane.

### Git Hygiene

- Pre-commit hooks enforced via `husky` (TS) or `pre-commit` (Python): lint + format on every commit.
- Conventional Commits required (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).
- Branch protection on `main`: PRs required, CI must pass, at least one approval for multi-contributor repos.
- `.gitattributes` at repo root: `* text=auto eol=lf`, and committed lockfiles (`pnpm-lock.yaml`, `uv.lock`) marked `linguist-generated` so GitHub language statistics emphasize primary sources.

### Dependency Management

- Automated dependency updates via Renovate or Dependabot on all repos.
- `npm audit` / `pip audit` run in CI on every PR. Fail on critical/high severity.
- Pin major versions of shared config packages; allow minor/patch auto-merge.
- Lock files (`pnpm-lock.yaml`, `uv.lock`) always committed.

### Security

- Secret scanning enabled (GitHub secret scanning or equivalent).
- No credentials, tokens, or API keys in code, config, or Docker layers.
- Container images scanned with Trivy (or equivalent) in CI for known CVEs.
- All server templates bind to `0.0.0.0` inside containers, never expose debug ports in production Compose.

### Error Handling

- Consistent error shape per lane: all backend APIs return the same external error contract even when framework internals differ.
- Backend API error responses expose exactly: `success: false`, `statusCode`, `timestamp`, `path`, `method`, `message`, `error`, optional `errors`, and optional `meta.requestId`.
- `timestamp` is ISO 8601 UTC. `path` includes the request path and query string where the framework exposes it safely. `method` is the HTTP verb from the incoming request.
- `message` is client-safe. Never expose stack traces, raw SQL, ORM internals, secrets, connection strings, tokens, or framework debug payloads in production responses.
- `error` is a stable machine-readable class name such as `ValidationError`, `ConflictError`, `NotFoundError`, `RateLimitError`, `BadRequestError`, `DatabaseError`, or `InternalServerError`.
- `errors` is reserved for field-level validation details and must remain JSON-serializable. Each framework may keep its native validation detail shape only if the OpenAPI schema documents it.
- `meta.requestId` comes from `X-Request-ID` when supplied or from the template request-id middleware when generated.
- Route/controller handlers should only translate input into application calls. Business errors are raised as typed domain/application exceptions and transformed at the framework boundary.
- Framework exception boundaries must handle validation errors, explicit HTTP/domain errors, rate-limit errors, known database conflicts/not-found cases, and unknown exceptions.
- Unknown exceptions return HTTP 500 with `InternalServerError`, are logged with stack/context server-side, and never expose internal details to clients.
- 4xx responses are logged at warn/info depending on framework conventions; 5xx responses are logged at error with request ID, method, path, status, and exception context.
- Unhandled rejection / uncaught exception handlers are required in all long-running server and CLI templates. They must log, flush, and terminate or delegate to the framework shutdown path rather than continuing in an unknown state.

### Graceful Shutdown

- All server templates handle `SIGTERM` cleanly: drain connections, close DB pools, flush logs.
- CLI templates handle `SIGINT` (Ctrl+C) without leaving temp files or broken state.
- Shutdown timeout configurable via env var (default 10s).

### Observability Baseline

- Structured JSON logging in all server templates (no `console.log` in production paths).
- Request ID propagated through the entire request lifecycle.
- Log levels configurable via env var (`LOG_LEVEL`).
- Health endpoints required for all server templates (defined in Portfolio Fundamentals and backend runtime defaults).
- Active backend monolith templates expose Prometheus metrics and OpenTelemetry traces with stable `OTEL_SERVICE_NAME` values.
- Local backend observability uses `observability-template-stack`: Prometheus for metrics, Tempo for traces, Loki plus Alloy for Docker logs, and Grafana dashboards on the shared `templates-observability` network.

### Licensing

- Every active repo (app templates and shared config packages) must have a `LICENSE` file at the repo root.
- Default license: MIT. Any deviation requires an explicit note in this governance doc.

### CI Pipeline Shape

- Every repo exposes a canonical `check` command. In ecosystems without package scripts, CI may run a documented explicit equivalent sequence when coverage/artifact upload or toolchain shape requires finer-grained steps.
- CI must run on every PR and on `main` push.
- CI matrix: test on the minimum supported runtime version only (no multi-version matrix unless documented reason).
- CI caching enabled for `node_modules` / `.venv` / Docker layers.
- Coverage collected on every CI run (`jest --coverage` / `pytest --cov`). Report uploaded as a build artifact (retention: 7 days). External coverage service (Codecov, etc.) is optional.
- GitHub Actions should stay free-tier friendly: avoid duplicate audit/test work across CI and security workflows, avoid always-on Docker image builds, and keep scheduled jobs to a minimal monthly cadence.
- Standardize on one action version per ecosystem unless pinned otherwise: `actions/checkout`, `actions/setup-node`, `actions/setup-python`, `pnpm/action-setup`, `astral-sh/setup-uv`.
- Security scans should use pinned action versions or major tags, never floating `@master`.
- Security workflows own dependency audit scans. Main CI should not duplicate `npm audit` / `pip-audit` unless a repo has no dedicated security workflow.
- Docker security workflows should prefer filesystem/config scanning over full image builds unless image-build validation is the explicit purpose of the workflow.
- CD workflows should only deploy from successful `main` CI runs and should use concurrency cancellation to prevent stacked deploys.

---

## Standards by Lane

### Frontend / Fullstack (React Templates)

**Always include:**

- `eslint-config-shared`, `prettier-config-shared`, `tsconfig-shared`, `vitest-config-shared` from shared config packages.
- Vitest for unit/component tests, runs in CI.
- Playwright for E2E, config present, at least one smoke test passing locally. E2E does **not** run in CI yet.
- Consumer-owned hooks, utilities, and test helpers. Duplicate small, high-value runtime primitives locally instead of centralizing them prematurely.
- Docker Compose for any backend services the frontend depends on (DB, API, etc.).
- `tailwindcss` as the default styling baseline (unless the template is purely logic).
- Route-level code splitting as the default.
- `eslint-plugin-jsx-a11y` for accessibility linting. Semantic HTML enforced; no `<div>` click handlers without roles.
- Route-level UX boundaries: pending and Suspense fallbacks, error boundaries with a recovery path, and missing-route (not-found) screens. Use each framework's native mechanisms (for example Next.js App Router boundaries, React Router error elements and hydration fallbacks, TanStack Router error/not-found components, Astro client routing patterns). Matching Next.js file names or folder conventions is not required; visual design, layout, motion, copy tone, and accessibility must align with the Next.js template as the portfolio reference so all web templates feel like one product. React Native / Expo adopts the same design language where stack-level error and loading patterns apply.
- TanStack Query as the default data-fetching/cache layer for all API calls. No raw `fetch` in components.
- Standardized loading, error, and empty-state patterns: every data-dependent view handles all three states explicitly.
- Bundle analysis tooling: `@next/bundle-analyzer` (Next.js) or `rollup-plugin-visualizer` (Vite). Run on demand, not in CI.
- Image optimization: use framework-native image components (`next/image`, responsive `<img>` with `srcset`). No unoptimized images in production builds.
- SEO baseline for SSR templates: `<title>`, `<meta description>`, Open Graph tags, canonical URL, `robots.txt`, `sitemap.xml`.
- Lighthouse CI threshold recommended (performance >= 90, accessibility >= 95) for SSR templates. Advisory, not blocking.
- Font strategy: self-hosted or `next/font`. No external font CDN calls in production.
- React Compiler: all templates that ship React UI (`next-template-fullstack`, `react-router-template-fullstack`, `tanstack-template-fullstack`, `astro-template-fullstack` React islands, `expo-template-mobile`) must adopt the official React Compiler integration for their toolchain.

**Never include:**

- CSS-in-JS libraries (too much runtime overhead, too much churn).
- Multiple state management solutions, pick one and standardize.
- Backend logic inside frontend templates (use API templates for that, except it is next.js, then use the next.js api routes).
- Unoptimized client-side data fetching patterns (waterfall requests, missing cache invalidation).

---

### Frontend / Fullstack (Angular Templates)

Angular web templates follow the same portfolio contracts as the other full-stack web templates while staying framework-native. `next-template-fullstack` remains the visual and route-state reference for loading, error, not-found, copy tone, layout, and accessibility across all web templates.

**v1 scope:**

- One template: `angular-template-fullstack` with `@angular/ssr`.
- Additional Angular variants (`angular-template-spa`, Analog-based fullstack) stay out of scope until a separate governance item approves them.

**Always include:**

- `eslint-config-shared/angular`, `prettier-config-shared`, `tsconfig-shared/angular`, and `vitest-config-shared/angular` from shared config packages.
- Vitest for unit/component tests, runs in CI. Karma/Jasmine is not the portfolio default for Angular templates.
- Playwright for E2E, config present, at least one smoke test passing locally. E2E does **not** run in CI yet.
- Consumer-owned services, directives, pipes, utilities, and test helpers. Duplicate small, high-value runtime primitives locally instead of centralizing them prematurely.
- Docker Compose for any backend services the frontend depends on (DB, API, etc.).
- `tailwindcss` as the default styling baseline.
- Route-level lazy loading as the default.
- `angular-eslint` with template accessibility rules instead of `eslint-plugin-jsx-a11y`.
- Route-level UX boundaries: pending/resolver loading UI, global `ErrorHandler` with recovery path, and wildcard not-found routes. Matching Next.js file names or folder conventions is not required; visual design must align with `next-template-fullstack` as the portfolio reference.
- `@tanstack/angular-query-experimental` as the default data-fetching/cache layer for all API calls. No raw `fetch` or direct `HttpClient` calls in components; route data through the governed query layer or an injected service boundary.
- Standardized loading, error, and empty-state patterns: every data-dependent view handles all three states explicitly.
- Bundle analysis tooling: Angular build stats or `source-map-explorer` / `rollup-plugin-visualizer` where applicable. Run on demand, not in CI.
- Image optimization: `NgOptimizedImage`. No unoptimized images in production builds.
- SEO baseline for SSR templates: `Title`/`Meta` services, Open Graph tags, canonical URL, `robots.txt`, `sitemap.xml`.
- Lighthouse CI threshold recommended (performance >= 90, accessibility >= 95) for SSR templates. Advisory, not blocking.
- Font strategy: self-hosted `@font-face` in global styles. No external font CDN calls in production.
- Zoneless change detection (`provideExperimentalZonelessChangeDetection`) as the modern Angular default where the chosen Angular version supports it stably.
- Standalone components, strict templates, and signals-first component state as defaults.
- `zod` env validation at bootstrap through `provideAppInitializer` or equivalent fail-fast startup wiring.
- MSW for local development and unit tests when API mocking is needed.
- Governed security headers (CSP, COOP, Permissions-Policy, Referrer-Policy, X-Content-Type-Options, X-Frame-Options) applied at the SSR server or reverse-proxy layer. HSTS remains deployment-owned.
- Health sample endpoint and non-blocking UI example aligned with GOV-088 once the Angular template exists.

**Framework capability matrix (planned v1):**

| Template | Framework Contract | Data + Infra | Testing | Shared Config Use | Unique Repo Facts to Preserve |
| -------- | ------------------ | ------------ | ------- | ----------------- | ----------------------------- |
| `angular-template-fullstack` | Angular 19+ standalone app with `@angular/ssr`, Angular Router, `app.config.ts` provider boundaries, and optional governed health/BFF routes on the SSR server. | Tailwind 4, Docker dev/prod Compose, typed public env contract, SEO metadata, security headers, health endpoint. | Vitest + Angular test bed, Playwright smoke (local only), MSW in dev/tests. | `eslint-config-shared/angular`, `prettier-config-shared`, `tsconfig-shared/angular`, `vitest-config-shared/angular`. | Zoneless default, TanStack Query Angular adapter, `lucide-angular`, no NgModules in v1 scaffold. |

**Never include:**

- CSS-in-JS libraries.
- Multiple state management solutions; TanStack Query plus local component/signal state covers the baseline.
- Backend business logic inside frontend templates (use API templates for that; governed health/BFF routes only).
- Unoptimized client-side data fetching patterns (waterfall requests, missing cache invalidation).
- An `angular-shared` runtime package.
- NgModule-based bootstrap in new scaffolds unless a documented framework constraint requires it.

---

### Backend APIs (NestJS + FastAPI + Django + AdonisJS + Spring Boot)

Backend governance is organized by contract first, framework second. Every backend template must expose the same operational behavior while keeping its framework-native structure.

**Common API contract:**

- Docker Compose with DB (Postgres default), and any other required infra.
- Multi-stage Dockerfile (dev stage + prod stage).
- **OpenAPI / Swagger UI** reachable from `/docs`. NestJS uses `@nestjs/swagger`; FastAPI uses built-in docs; Django uses Django Ninja and may redirect `/docs` to `/api/docs`; AdonisJS must serve a real OpenAPI/Swagger document, not a placeholder status endpoint.
- Health endpoints: `GET /health`, `GET /health/live`, `GET /health/ready`.
- Metrics endpoint: `GET /metrics` (Prometheus-compatible).
- Structured JSON logging with request ID correlation.
- Request validation and typed error responses that follow the Error Handling contract above.
- Framework-native ORM or query builder with explicit migrations.
- `.env`-based config with validation at boot.
- Rate limiting / throttling configurable via env vars.
- CORS configured via env vars (`CORS_ORIGINS`). Default: restrictive. Never `*` in production.
- Security headers. CSP, HSTS, X-Content-Type-Options, and clickjacking protection are required where the framework can enforce them.
- Graceful shutdown: drain HTTP connections, close DB pool, flush logs on `SIGTERM`. Timeout from env var.
- Database connection pooling explicitly configured where the ORM/driver exposes it. Pool size from env var.
- API versioning via URL prefix (`/api/v1`). Version embedded in OpenAPI spec.
- Pagination contract: all list endpoints return `{ data, meta: { total, page, pageSize } }`. Cursor-based pagination for high-volume endpoints.
- Database seeding script (`db:seed`) for local development and e2e test setup.
- Request timeout: configurable per-route or global (default 30s). Timeout on external HTTP calls (default 5s).
- Soft-delete pattern for domain entities that require audit trails. Hard-delete only where legally required.

**Framework capability matrix:**

| Template | Framework Contract | Data + Infra | Testing | Shared Config Use | Unique Repo Facts to Preserve |
| -------- | ------------------ | ------------ | ------- | ----------------- | ----------------------------- |
| `adonis-template-monolith` | AdonisJS 7 TypeScript API with controllers, services, validators, middleware, exception handler, `adonisrc.ts` providers, generated OpenAPI/Swagger. | Lucid ORM, PostgreSQL, Redis, Docker dev/prod/observability Compose, pgAdmin local profile, Nginx production-like entrypoint, OTel, Prometheus, health endpoints, CORS, `/api/v1`. | Japa unit/functional tests. | `eslint-config-shared` base+node and `prettier-config-shared`; intentionally uses `@adonisjs/tsconfig`, not `tsconfig-shared`. | VineJS validation, `adonis-autoswagger`, hot-hook HMR, Adonis provider system. README version drift is tracked by GOV-101. |
| `spring-template-monolith` | Spring Boot 4.1 Java 25 LTS API with controller/service/repository, Bean Validation, Flyway, JPA/Hibernate, Actuator health, and springdoc OpenAPI. | PostgreSQL via JPA/Flyway, Redis via Lettuce, Docker dev/prod/observability Compose, pgAdmin profile, Nginx production-like entrypoint, OTel via Micrometer tracing, Prometheus, health endpoints, CORS, `/api/v1`. | JUnit 5 + MockMvc with H2, JaCoCo coverage profile, and an isolated test profile. | Spotless (google-java-format) + Checkstyle, `Makefile` + tracked Maven Wrapper. | Maven 3.9.16, Hikari pool, Jackson 3, `logstash-logback` JSON, `springdoc` 3 at `/docs` + `/openapi.json`; Flyway runs as an explicit pre-start step. |
| `spring-template-microservice` | Spring Boot 3.4 Java 21 microservice with same stack plus NATS JetStream, bounded service ownership. | Same as monolith plus NATS JetStream (`jnats` 2.22), one Postgres + NATS per service in Compose/stack, readiness checks for NATS. | Same as monolith plus NATS contract readiness. | Same as monolith, plus NATS dev dep `jnats`. | Governed broker = NATS JetStream; Redis for cache/rate-limit only; mirrors Nest micro `transport-node/jetstream` boundary. |
| `gin-template-monolith` | Gin 1.11 Go API with handler/service/repository layers, `Register(*gin.RouterGroup)` module mounting, middleware pipeline for correlation/logging/errors/CORS/security/throttle/timeout, and a hand-built OpenAPI document served at `/docs` + `/openapi.json`. | pgx/v5 + pgxpool, PostgreSQL, Redis via go-redis/v9, golang-migrate with embedded SQL, Docker dev/prod/observability Compose, pgAdmin `tools` profile, Nginx production-like entrypoint, OTel via otelgin, Prometheus, health endpoints, CORS, `/api/v1`. | stdlib `testing` + `httptest`, race detector, `-shuffle=on`, in-memory repositories so `make test` needs no infrastructure. | `golangci-config-shared` (lint + format), `gotest-config-shared` (test + coverage). | `log/slog` JSON logging with no logging dependency; response envelopes applied by explicit responders rather than an interceptor skip-list; migrations embedded in the binary; separate `api`/`migrate`/`seed` binaries from one image. |
| `nest-template-monolith` | NestJS 11 modular API with module-per-domain structure, dependency injection, decorator routing, guards, interceptors, filters, DTO validation, conditional Swagger through `DOCS_ENABLED`. | Prisma ORM/generated client, PostgreSQL, Redis through `ioredis`, Terminus health checks, Throttler, Helmet, Winston daily rotate logging, Prometheus, OTel, production-like Nginx Compose, pgAdmin local profile. | Jest unit tests and Supertest e2e with dedicated test DB. | `eslint-config-shared`, `prettier-config-shared`, `tsconfig-shared` base. | Multiple TS configs (`build`, `seed`, `spec`), Prisma Studio, `src/generated/` Prisma client, `@nestjs/cache-manager` pattern where caching is needed. |
| `fastapi-template-monolith` | Async-first FastAPI API with module-per-domain structure, Pydantic validation/settings, dependency injection through `Depends()`, OpenAPI docs, lifespan startup/shutdown. | SQLAlchemy async, asyncpg, Alembic migrations, Redis, structlog, Prometheus, slowapi, OTel instrumentation for FastAPI/httpx/SQLAlchemy/Redis, production-like Nginx Compose, pgAdmin local profile. | pytest, pytest-asyncio, pytest-cov, e2e marker. | `ruff-config-shared`, `mypy-config-shared`, `pytest-config-shared` package baselines. | DB pool tuning env vars (`DATABASE_POOL_SIZE`, `DATABASE_MAX_OVERFLOW`, `DATABASE_ECHO`), `httpx.AsyncClient`, deterministic `app/seed.py`, Alembic reads app settings. |
| `django-template-monolith` | Django 6 + Django Ninja API with Django-native settings, ASGI entrypoint, typed Ninja schemas/routes, native migrations, `/docs` OpenAPI route or redirect. | Django ORM, PostgreSQL via psycopg, Redis via django-redis, structlog, Prometheus, django-ratelimit, OTel instrumentation for Django/psycopg/Redis/ASGI, production-like Nginx Compose, pgAdmin local profile. | pytest-django, pytest-asyncio, pytest-cov, e2e marker. | `ruff-config-shared`, `mypy-config-shared`, `pytest-config-shared` package baselines. | `manage.py check --deploy`, Django security env vars (`SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`), `LOG_JSON`, `THROTTLE_LIMIT`, uvicorn+gunicorn ASGI. |

**Never include:**

- Raw SQL strings outside of repositories.
- Synchronous blocking calls inside async endpoints.
- Business logic in route handlers.
- N+1 query patterns: always eager-load or batch-load related entities in list endpoints.
- Unbounded queries: all list endpoints must have default and maximum page size limits.
- Framework facts copied into governance without verifying package metadata and source files.

**Microservice inheritance baseline:**

- Every governed backend monolith family should have a paired microservice template: NestJS, FastAPI, Django, and AdonisJS. Missing pairs stay planned until a scaffold item is approved.
- Microservice templates are built from the matching monolith family conventions, then narrowed to bounded service responsibilities. Preserve framework-native structure, config validation, Docker shape, logging, tracing, metrics, health, tests, and docs generation.
- NestJS microservice uses `@nats-io/transport-node` and `@nats-io/jetstream` for the governed broker boundary. Redis may remain available for cache, rate limiting, jobs, and idempotency state, but it is not the governed event backbone.
- Microservice templates inherit backend API operational defaults only where they still fit a bounded service: health endpoints, Prometheus metrics, structured JSON logs, request IDs, OpenTelemetry, env validation, Docker runtime shape, CI quality gates, and OpenAPI docs for HTTP surfaces.
- Microservice templates must adapt monolith defaults where distributed boundaries change the problem: service-to-service auth, trace propagation through HTTP and events, readiness checks for brokers and downstream services, contract tests, secret injection, deployment values, multi-service integration testing, idempotent consumers, replay safety, and dead-letter handling.
- Microservice templates must not blindly copy broad monolith CRUD surfaces, monolith seed-data assumptions, direct public exposure assumptions, app-wide database ownership, admin tooling exposure, or one-process deployment assumptions. Each service owns one bounded context and publishes explicit contracts.
- Microservice data ownership defaults to one datastore schema/database per service. Shared databases across services require a governance item and a migration path away from cross-service table ownership.
- Microservice public exposure is opt-in. Internal services default to private network access through Compose/Kubernetes service discovery; public ingress requires an explicit API gateway or ingress decision.
- Local multi-service orchestration baseline: `microservices-template-stack/docker-compose.yml`, shared `templates-microservices` network, NATS JetStream, Redis, one Postgres service per microservice, hot reload for app services, dependency ordering, health checks, env-controlled ports, and per-service logs. Tilt may be added later as an optional advanced workflow, not the required baseline.
- Async broker baseline: NATS JetStream for durable eventing with persistence, acknowledgements, replay, and dead-letter handling. Redis remains available for cache, rate limiting, and job queues, not as the governed event backbone.
- Sync service-call baseline: HTTP with OpenAPI-generated clients. gRPC remains an advanced option for projects that explicitly need it, not the default template contract.
- Async event baseline: CloudEvents-style envelope with `id`, `type`, `source`, `time`, `dataVersion`, and `data`; payload schemas are versioned and validated by contract tests.
- Kubernetes delivery baseline: shared Helm library chart pattern. Each service supplies minimal values; the shared chart owns Deployment, Service, Ingress, probes, ConfigMap/Secret wiring, resource requests/limits, and autoscaling defaults.

**Microservice implementation gates:**

- Work advances one governance item at a time. Before implementation starts for each item, update that board row to `In Progress` with the approved scope; after validation, update the row outcome and status. Do not batch status changes across unrelated items.
- Agent subtasks should be bounded by governance item and file ownership. Use read-only explorer agents for audits and conflict checks before implementation; use worker agents only after approval, with disjoint write scopes such as platform stack files, Nest service code, Python service code, docs, or tests.
- Completed GOV-077 publisher/consumer verification lives in the stack test harness. Do not add sample business publisher/consumer behavior to template app code just to prove the broker.
- Completed GOV-077 acceptance: NATS runs through `microservices-template-stack`; the stack harness publishes typed governed envelopes, validates pull-consumer acknowledgement, demonstrates retry and dead-letter behavior, verifies FastAPI-to-Nest plus Nest-to-FastAPI exchange, and readiness includes broker connectivity. Redis Streams must not remain the governed event path.
- GOV-078 defines the sync service-call rule without hard-coding peer template names into generic repositories. Acceptance: each producer template exposes accurate OpenAPI JSON and `/docs`; real consumers use generated client code rather than hand-written service fetch calls; the generation command is reproducible and documented in the consuming service; generated code ownership is explicit; a focused test proves the consumer compiles or type-checks against the generated client. Template repos may include framework-neutral hooks or docs only. Concrete cross-framework client-generation proof lives in `microservices-template-stack` or real service repos. Auth and full contract testing stay in GOV-082 and GOV-084.
- Deferred production concerns stay centralized in this governance board, not in child-template governance files. Service-to-service auth is GOV-082, secrets are GOV-083, contract testing is GOV-084, OpenAPI response validation is GOV-085, Helm delivery is GOV-086, and multi-service CI/release policy is GOV-087.
- GOV-099 starts by preserving each monolith family's framework conventions while narrowing scope to bounded services. Django keeps Django Ninja, Django ORM/migrations, ASGI, pytest-django, Ruff/mypy, structlog, Prometheus, health, and Docker conventions. AdonisJS keeps Lucid/migrations, Japa, OpenAPI docs, TypeScript tooling, health, metrics, and Docker conventions. Both differ from monoliths by avoiding broad task CRUD, monolith seed assumptions, direct public exposure assumptions, and app-wide database ownership.

---

### CLI (Click + Commander)

**Always include:**

- Layered architecture: commands → services → utilities.
- `--help` on every command and subcommand (framework default, do not suppress).
- A `--version` flag wired to the package version.
- Exit codes: `0` success, `1` user error, `2` unexpected error.
- Structured logging to stderr; data output to stdout (pipeable by default).
- Docker image optional but encouraged for distribution.
- Test coverage for command logic via unit tests (not just CLI invocation).
- Progress indicators (`rich.progress` for Python, `ora`/`cli-progress` for TS) for operations exceeding 1s.
- `--no-color` flag and `NO_COLOR` env var support (respect the [no-color.org](https://no-color.org) convention).
- `--verbose` / `--quiet` flags controlling log verbosity. Default: normal (errors + warnings to stderr).
- Graceful `SIGINT`/`SIGTERM` handling: clean up temp files, close connections, exit with appropriate code.
- Configuration file support: optional TOML (Python) or JSON/YAML (TS) config file. CLI flags override config file, config file overrides env vars.
- Shell completion generation (`click` built-in; Commander via `omelette` or custom).
- Input validation on all arguments and options before execution begins. Fail fast with clear error messages.
- Machine-readable output mode (`--json` or `--output json`) for all data-producing commands.

**Click-specific (Python):**

- `pyproject.toml` as the single project definition.
- `click.testing.CliRunner` for test isolation.
- Configuration via env vars with Click's `auto_envvar_prefix`.
- `rich` for formatted terminal output (tables, panels, syntax highlighting).
- Click groups for organizing subcommands. Never flatten unrelated commands at the top level.

**Commander-specific (TypeScript):**

- `package.json` `bin` field wired correctly.
- Vitest for unit tests; `execa` or similar for integration tests.
- Bundled with `tsup` to a single distributable.
- `zod` for argument/option validation.
- Subcommand pattern via Commander's `.command()` for organizing related functionality.

**Never include:**

- Interactive prompts without a non-interactive fallback (all prompts must be skippable via flags/env vars for CI usage).
- Hardcoded file paths; always resolve relative to `cwd` or a configurable base path.
- Color output without a no-color escape hatch.

---

### Mobile (React Native / Expo)

**Always include:**

- Expo SDK (current active LTS) with New Architecture enabled (`newArchEnabled: true` in `app.json`). Old Architecture is not supported.
- Expo Router for file-based navigation. No React Navigation wiring by hand.
- `jest-expo` preset for unit and component tests. Vitest is web-only and not used in mobile templates.
- `@testing-library/react-native` for component tests. Always wrap renders in a shared `createWrapper()` that provides all required context providers.
- TanStack Query as the default data-fetching/cache layer. No raw `fetch` calls in components.
- All `EXPO_PUBLIC_*` env vars validated at startup via Zod. Fail fast if required vars are missing.
- `tsconfig-shared/expo` as the TypeScript baseline (`"jsx": "react-native"`, `"moduleResolution": "bundler"`).
- `eslint-config-shared` (base) + `eslint-config-shared/react-native` for linting. No `jsx-a11y` — use React Native's native accessibility model (`accessible`, `accessibilityLabel`, `accessibilityRole`).
- Docker covers the **Expo web** export path only: multi-stage Dockerfile builds `expo export --platform web`, nginx serves the static bundle. Native (iOS/Android) builds use EAS Build — never containerized.
- `docker-compose.yml` for local web dev (Metro web target). Note in README that simulator-based development requires native tooling.
- Pre-commit hooks via Husky: lint-staged (ESLint + Prettier) + commitlint.
- Conventional commits enforced.
- GitHub Actions CI: lint + typecheck + test + security audit on every PR and `main` push.
- E2E (Maestro or Detox) is local-only, same policy as Playwright in web templates. No E2E in CI.
- Platform-specific components use `.ios.tsx` / `.android.tsx` extension splits where needed. Shared logic in `.tsx` with `Platform.select()` for minor differences.
- Assets (`assets/images/`, `assets/fonts/`) committed and referenced via `require()`. No dynamic asset URLs.
- `renovate.json` present. Expo SDK and `react-native` major upgrades require manual review (not auto-merged).

**Never include:**

- Old Architecture dependencies (`react-native-reanimated` <4, `@shopify/flash-list` <4, or any package that requires bridge).
- Multiple navigation solutions. Expo Router is the only navigation layer.
- Global state libraries (Zustand, Jotai, Redux) unless a concrete need is documented. TanStack Query + React Context covers the baseline.
- Inline styles for anything beyond one-off layout adjustments. Use `StyleSheet.create()` for reuse and performance.
- Hardcoded color literals scattered through components. Route all color tokens through the `Colors` constants file.
- EAS Build configuration committed to the template — it is consumer-specific (bundle identifier, signing keys, build profiles).

---

## Language & Runtime Notes

### TypeScript Projects

- `strict: true` in tsconfig — no exceptions.
- `eslint-config-shared` + `prettier-config-shared` as baselines; no local overrides without documented reason.
- `tsconfig-shared` extended in every TS project unless the framework owns a required compiler baseline; current approved exceptions: AdonisJS uses `@adonisjs/tsconfig`; Angular uses `tsconfig-shared/angular` layered on top of the Angular compiler requirements from `@angular/cli`.
- `vitest-config-shared` for test config (React, Angular, and CLI templates). Angular uses `vitest-config-shared/angular`; Karma/Jasmine is not the portfolio default.
- `eslint-config-shared/angular` for Angular templates through `angular-eslint`; React-specific ESLint presets are not reused for Angular source or templates.
- `zod` for runtime validation at all system boundaries (API input, env vars, external data).
- Never use `any` in application code; use `unknown` and narrow explicitly.
- `pnpm` as the package manager; `packageManager` field required in `package.json`.
- Node version pinned in `.nvmrc` or `engines` field.
- Bind packages locally to avoid npm publishing.

### Python Projects

- Python `3.12+` as the baseline.
- `uv` for dependency management and virtual environments (fast, reproducible).
- `pyproject.toml` as the single project definition — no `setup.py`, no `requirements.txt`.
- `ruff` for linting and formatting (replaces flake8, isort, black — one tool).
- `mypy` (strict mode) for type checking.
- `pytest` for all tests; `pytest-cov` for coverage.
- Python app templates consume `teo-ruff-config-shared`, `teo-mypy-config-shared`, and `teo-pytest-config-shared` as dev dependencies where the tool applies.
- Ruff is the only Python tool in this set with native config inheritance; consumers generate `ruff.extend.toml` from `teo-ruff-config-path`, ignore that generated file, and keep only framework-specific Ruff overrides locally.
- mypy and pytest use one active config file and do not merge inherited project configs. Consumers keep local mypy/pytest config when they need plugins, Django settings, markers, or coverage source, using the shared packages as the canonical baseline rather than a fake inheritance layer.
- Type annotations required on all public functions and class members.
- `pydantic v2` for data validation and settings.
- Never use mutable default arguments; never use bare `except:`.
- Bind packages locally to avoid PyPI publishing.

### Java Projects

- Java `25` LTS (Temurin recommended — GraalVM 25 LTS acceptable where IT mandates, e.g. `25.0.4-graal`) as the baseline for new and upgraded Java templates, with a tracked Maven Wrapper (`mvnw`). Templates pin major `25` only; patch floats with LTS updates (`25.0.3` → `25.0.4` etc.) via `pom.xml: java.version=25`, `docker/Dockerfile: eclipse-temurin:25-*`, and CI `java-version: "25"`. The existing Spring microservice remains on Java 21 until it receives a separately scoped upgrade.
- `pom.xml` as the single project definition — no Gradle co-build in the same repo.
- `Spotless` + `google-java-format` for formatting and `Checkstyle` for lint (mirror ESLint/Prettier).
- `JUnit 5` + `MockMvc` for all tests; `JaCoCo` for coverage (`target/site/jacoco`).
- `Spring Boot 4.1` parent and its modular starters for Web MVC, validation, data JPA, Actuator, and tests.
- `Flyway` for migrations, `Hikari` for connection pooling, `Lettuce` for Redis.
- `H2` for unit tests with `application-test.yml` isolated profile; `Testcontainers` for e2e where available.
- Bind artifacts locally; no Maven Central publishing required for templates.

### Go Projects

- Go `1.25+` as the baseline, declared in `go.mod` and read by CI through `go-version-file`.
- Go modules with a committed `go.sum`; `go.sum` is marked `linguist-generated` in `.gitattributes`.
- `golangci-lint` v2 for **both** linting and formatting. golangci-lint v2 owns `run` and `fmt` from one config file, so Go gets a single lint+format package (`golangci-config-shared`) the way Python gets Ruff — not an ESLint/Prettier split.
- Formatting is `gofumpt` (extra rules) plus `gci` with import grouping standard → default → `prefix(github.com/teo-garcia)`.
- `gotest-config-shared` owns test and coverage settings. The Go toolchain has no coverage exclusions, no LCOV output, and no threshold check, so that package supplies all three on top of the standard profile format.
- Tests run with `-race -shuffle=on`; `-covermode=atomic` is required whenever `-race` is on, and `-coverpkg=./...` is required so a layered service is credited for coverage its HTTP tests produce in other packages.
- `golangci-lint` is pinned by version in the `Makefile` and CI and installed into a repo-local `./bin`, so lint tooling never enters the application module graph.
- Go templates use a `Makefile` for the script surface; there is no `package.json` equivalent.
- Structured logging uses stdlib `log/slog`. No third-party logging dependency.
- Configuration is parsed and validated once at startup into a typed struct; nothing else reads `os.Getenv`.
- Errors are typed domain values translated to HTTP at the framework boundary. Never return driver text, SQL, or wrapped internals to a client.
- Bind modules locally; no proxy publishing is required for templates.

### Backend Runtime Defaults

Active backend templates must share the same operational defaults unless a
framework-specific reason is documented in that repo:

- Public API prefix defaults to `/api/v1`. Health, metrics, and docs stay outside
  the API prefix.
- Health endpoints are `GET /health/live`, `GET /health/ready`, and
  `GET /health`.
- Metrics endpoint is `GET /metrics`, emits Prometheus text, is enabled for
  development by default, and can be disabled by `METRICS_ENABLED=false`.
- API docs are reachable at `GET /docs`; OpenAPI JSON is reachable at the
  framework-native path or redirected/documented equivalent.
- Development defaults enable CORS for `http://localhost:3000`; test defaults
  disable CORS unless the test is specifically asserting CORS behavior.
- Default rate limit is approximately `100` requests per minute in normal
  runtime and `1000` requests per minute in tests. Syntax may vary by framework.
- Request correlation uses the `X-Request-ID` header and error responses expose
  `meta.requestId`.
- Local/test database names use the repo slug plus `_test` for test databases.
- Backend monolith templates expose deterministic seed commands that recreate the same sample task set after migrations. Microservice seed policy must be explicit per bounded service and must not copy monolith sample data by default.
- Redis defaults to `localhost:6379` with an empty password. Templates that cache
  data must expose an explicit TTL; tests may lower it or use an isolated Redis DB.
- Docker images bind application servers to `0.0.0.0`, expose the same port as
  the runtime default, and healthcheck `GET /health/live`.
- Production-like backend monolith Compose paths use Nginx as the public entry point on `HTTP_PORT`. App, Postgres, and Redis ports stay internal in that override; Nginx forwards `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Real-IP`, enables request/response buffering, and passes through health, metrics, docs, and API routes.

### Migration Safety Contract

Active backend templates must treat database migrations as production change
management, not just local developer setup:

- Migrations run as a pre-deploy step before the new app version starts.
- Migrations must be backward-compatible with the currently running production
  version. Add columns/tables/indexes before code uses them; stop using columns
  before dropping or narrowing them.
- Destructive changes require an expand-contract sequence across at least two
  deploys: expand schema, deploy compatible code, backfill if needed, deploy
  code that no longer reads the old shape, then contract schema.
- `db:migrate` / `db-deploy` commands must be idempotent and safe to re-run
  when no pending migrations exist.
- Rollback means restoring a known-good database backup plus deploying
  compatible code, or applying a forward-fix migration. Down migrations may be
  documented for local development, but they are not the primary production
  rollback strategy.
- Migration commands must never run against production from app startup,
  request handlers, seed scripts, or test setup.
- Each backend README documents the production migration order, rollback
  posture, and common anti-patterns.

### Docker

- Multi-stage Dockerfiles: `deps` → `builder` → `production`. Separate `Dockerfile.dev` for development.
- All Dockerfiles live in `docker/` directory. Compose references them via `dockerfile: docker/Dockerfile`.
- Production image must run as non-root user (`addgroup`/`adduser` in alpine).
- Production image uses a runtime-appropriate slim base (`node:XX-alpine`, `python:XX-slim`, or nginx for static web output).
- `dumb-init` or equivalent signal forwarding is required in long-running Node/Python production images.
- `.dockerignore` must exclude `node_modules`, `__pycache__`, `.env`, `dist`, `.git`, test files, IDE files.
- Compose service names must match the env var conventions used by the app.
- Health checks required in both Dockerfile (`HEALTHCHECK`) and Compose (`healthcheck` block) for all services.
- Volumes for persistent data declared explicitly; never rely on anonymous volumes in dev.
- Dev Compose mounts source directories for hot reload; never mounts `node_modules`.
- Secrets via env vars only, never baked into image layers. No `ARG`/`ENV` for secrets at build time.
- `EXPOSE` must match the `PORT` env var default. All services bind to `0.0.0.0` inside containers.
- Telemetry disabled at build time (`NEXT_TELEMETRY_DISABLED=1` for Next.js).
- `pnpm prune --prod`, framework-specific standalone output, or `uv`/wheel-only Python installs minimize production image size.
- Compose uses `profiles` only when a service is optional; required services have no profile.
- All Compose port bindings use env vars with sensible defaults (`${PORT:-3000}:3000`).
- Backend app templates may include a production-like Compose override that uses the production Dockerfile, removes app source mounts, disables optional local admin tools unless profiled, hides direct data-store host ports, and sets production runtime flags.

---

## Change Control

Any change that alters template contracts must follow this order:

1. Update governance intent/policy here.
2. Add or update board item(s) below.
3. Implement repo changes.
4. Validate with scripts and CI.
5. Mark board status progression.

---

## Open Governance Board

Only open governance work is listed here. Completed items are removed from the board once their decisions are represented in the fundamentals above.

Legend: Priority `P0` critical · `P1` high · `P2` medium · `P3` low — Status `Todo` · `Next` · `In Progress` · `Blocked` · `Incubating`

| ID      | P   | Status | Track       | Scope                                    | Problem                                                                                                         | Target Outcome                                                                                |
| ------- | --- | ------ | ----------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GOV-013 | P2  | Todo   | Expansion   | `click-template-layered`                 | Click template planned but contract, scaffold, and docs target not defined.                                     | v1 scaffold with layered structure, scripts, tests, and docs target.                          |
| GOV-014 | P2  | Todo   | Expansion   | `commander-template-layered`             | Commander template planned but not tracked on board.                                                            | v1 scaffold with layered structure, scripts, tests, and docs target.                          |
| GOV-034 | P3  | Todo   | DX          | CLI templates (planned)                  | CLI templates planned but no progress indicator, `--json` output, or config file patterns defined.              | All CLI always-include standards met in v1 scaffolds.                                         |
| GOV-043 | P2  | Todo   | Architecture | Backend microservice templates           | Microservice architecture changes were paused until the portfolio defined the best path for managing microservice templates. The path is now locked across all backend microservice pairs. | Implement the broker, outbox, and async contract baseline decided in GOV-077 and GOV-079 across approved microservice templates. |
| GOV-048 | P3  | Incubating | DevOps / Platform | `terraform-template-baseline`      | No IaC template exists. Cloud resource provisioning is repeated per project with no shared baseline.             | Explore a Terraform baseline for minimal shared infra: networking, IAM roles, secrets management, and managed Postgres. Define per-project vs shared variables before writing HCL. |
| GOV-049 | P3  | Incubating | DevOps / Platform | `helm-template-baseline`           | No Kubernetes delivery layer exists. App templates produce Docker images but nothing governs how they land in a cluster. | Explore a base Helm chart that app templates can extend or reference: Deployment, Service, Ingress, HPA, ConfigMap/Secret wiring, readiness/liveness probes, and resources. |
| GOV-059 | P1  | Todo   | Maintenance | Renovate PR backlog                      | There are 76 open account-level pull requests, including automation against repos governed as archived; major toolchains and GitHub Actions upgrades create recurring per-repo noise. | Clear or classify the backlog, remotely archive governed archives and disable their automation, move repeated policy to a hosted preset, require dashboard approval for majors, group Actions majors, cap concurrent PRs, and keep framework majors separate. |
| GOV-062 | P2  | Todo   | Mobile      | `expo-template-mobile`                   | Expo template has EAS build scripts but no governed native build profile, update, crash-reporting, or release-channel baseline. | Decide the minimal native release baseline for Expo templates.                                |
| GOV-069 | P2  | Todo   | Mobile DX   | `expo-template-mobile`                   | Babel `module-resolver` aliases `~` to repo root while TypeScript/Expo/Metro alias ownership is not documented. | Decide whether the Babel alias remains, or centralize aliasing through Expo/Metro/TypeScript config. |
| GOV-078 | P1  | In Progress | Architecture | Backend microservice templates      | The first attempt put concrete peer clients in generic templates, which violates the template boundary. The generic repos now need a framework-neutral sync-call rule, while concrete client-generation proof moves to the stack or real services. | Tighten producer OpenAPI schemas where needed, define generated-client ownership and commands without naming peer templates in generic repos, then prove cross-framework client generation outside template app code. |
| GOV-079 | P2  | Todo   | Architecture | Backend microservice templates           | The active NestJS/FastAPI pair now shares the governed envelope shape, but reusable payload schema fixtures and versioned async contract checks are not yet standardized. | Promote the async event envelope with `id`, `type`, `source`, `time`, `dataVersion`, and `data` into reusable schema fixtures and contract checks. |
| GOV-082 | P1  | Blocked | Security    | Backend microservice templates           | Microservices calling each other have no governed authentication pattern. Blocked on GOV-078.                    | Define service-to-service auth with JWT propagation plus short-lived service-account tokens; defer mTLS to Kubernetes delivery. |
| GOV-083 | P2  | Todo   | Security    | All active templates                     | `.env.example` plus environment variables does not cover shared secrets or rotation across N services.          | Define local Docker secrets, production-grade secret store wiring, and standard env-var naming across templates. |
| GOV-084 | P2  | Blocked | Testing     | Backend microservice templates           | Inter-service API contracts are not verified in CI. Blocked on GOV-078 and GOV-079.                             | Define contract testing for HTTP and async surfaces so producer changes cannot silently break consumers. |
| GOV-085 | P2  | Todo   | Testing     | All active backend templates             | OpenAPI specs are generated, but CI does not validate specs against actual HTTP responses.                       | Add OpenAPI contract validation against a live test server for all active backend templates.   |
| GOV-086 | P1  | Todo   | DevOps / Platform | `helm-template-baseline`        | The Helm chart baseline has no concrete contract.                                                               | Define the shared Helm library chart contract for service deployment, probes, config, secrets, resources, and autoscaling. |
| GOV-087 | P2  | Blocked | DevOps / Platform | Backend microservice templates     | Multi-service delivery lacks integration-test policy, image tags, registry namespace, and Renovate strategy. Blocked on GOV-086. | Define the multi-service CI contract, image tag conventions, GHCR namespace, integration test policy, and Renovate grouping. |
| GOV-088 | P2  | Todo   | Frontend DX | Web templates and `expo-template-mobile` | Healthcheck support exists but is inconsistent as a user-visible example.                                      | Standardize a non-blocking health-status sample across web and Expo templates, including Angular once GOV-104 lands. |
| GOV-090 | P1  | Todo   | Backend Security | All active backend templates          | Active backend templates do not include an authentication layer.                                                 | Ship a JWT Bearer authentication baseline with default-on protected routes and explicit public opt-outs. |
| GOV-091 | P1  | Todo   | Backend Architecture | All active backend templates       | Active backend templates lack a governed background worker pattern.                                             | Add Redis-backed worker processes with one illustrative job, queue health, concurrency config, and dead-letter behavior. |
| GOV-094 | P2  | Todo   | Backend API Design | All active backend templates       | API versions have no governed lifecycle for introduction, deprecation, or retirement.                            | Define Sunset/Deprecation headers, OpenAPI deprecation metadata, minimum notice window, and README support status. |
| GOV-095 | P2  | Todo   | Backend Architecture | All active backend templates       | App servers connect directly to Postgres, risking connection exhaustion in multi-replica deployments.            | Add PgBouncer as a sidecar service with direct DB URLs retained for migration tools and pool stats scraped. |
| GOV-096 | P2  | Todo   | Backend Testing | All active backend templates          | No active backend template includes load tests or performance acceptance thresholds.                             | Add local k6 scripts with latency and error-rate thresholds; keep them out of CI by default.   |
| GOV-097 | P2  | Todo   | Frontend DX | Active frontend and mobile templates     | Frontend and mobile env promotion rules are not governed.                                                       | Document public env prefixes, API URL strategy, MSW rules, feature flags, telemetry opt-in, and staging/production validation. |
| GOV-098 | P2  | Todo   | Tooling     | React web templates and `expo-template-mobile` | React-specific static analysis is not standardized.                                                            | Evaluate React Doctor as a governed analysis layer for React web and React Native templates.   |
| GOV-099 | P1  | Todo   | Expansion   | `django-template-microservice`, `adonis-template-microservice` | Django and AdonisJS microservice pairs are not yet represented as scaffold work.                                | Define and scaffold Django and AdonisJS microservice templates under the microservice baseline. |
| GOV-101 | P2  | Todo   | Documentation | `adonis-template-monolith`              | `adonis-template-monolith` package metadata and badge indicate AdonisJS 7, but the README feature table says AdonisJS 6. | Align README framework version and any related AdonisJS wording with the verified package metadata and governance framework matrix. |
| GOV-106 | P2  | Todo   | Frontend DX | Angular web templates                    | Angular public env prefixes and promotion rules are not documented.                                            | Document `NG_APP_*` (or chosen prefix), API URL strategy, MSW rules, and staging/production validation for Angular templates. |
| GOV-107 | P1  | Todo   | Governance | Portfolio control plane                  | The portfolio is now versioned in the `templates` repository with pinned submodules, but manually duplicated dates, counts, lifecycle state, and implementation snapshots can still drift. | Add a machine-readable `portfolio.yaml`, GOV issue or Project links, and a checker that derives or validates board counts, lifecycle, remotes, required files, workflows, and GitHub settings. |
| GOV-108 | P1  | Todo   | Governance | All active remote repositories           | Main and release-tag policies are mostly documentary: only two repos have weak branch protection, seven rulesets are disabled, direct or force pushes remain possible, and publication is triggered by unprotected `v*` tags. | Define solo-maintainer and published-package ruleset profiles; require CI-backed pull requests where appropriate, block force push/deletion, allow explicit emergency owner bypass, protect release tags, and use release environments for registry publication. |
| GOV-109 | P1  | Todo   | Security | All active remote repositories           | Workflow security is inconsistent with policy: audits can continue on error, permissions are often implicit, action tags are mutable, dependency review is uneven, and secret scanning/push protection is disabled on some active repos. | Add explicit least-privilege workflow permissions, make governed high/critical audits blocking, standardize dependency review, pin third-party actions to verified full SHAs with Renovate updates, and enable secret scanning plus push protection consistently. |
| GOV-110 | P1  | Todo   | Maintenance | Active and archived GitHub repositories  | Local lifecycle classification is not reflected remotely; archived repos remain writable and receive Renovate PRs, while `adonis-template-monolith`, `django-template-monolith`, and `fastapi-template-microservice` are not configured as template repositories. | Archive governed archives on GitHub, close automation PRs with replacement guidance, disable their update automation, mark every active starter as a GitHub template, and document whether generated repos are one-time snapshots or have an upgrade path. |
| GOV-111 | P1  | Todo   | Compliance | Active portfolio                         | Active assets violate required baselines: `fastapi-template-microservice` lacks CI/security/Docker-build workflows, `microservices-template-stack` lacks CI, and `astro-template-fullstack` lacks `.dockerignore`. | Bring each asset to the active baseline with canonical checks and required files, or downgrade its lifecycle until compliant; add these checks to the portfolio conformance tool. |
| GOV-112 | P1  | Todo   | Tooling | Shared config packages and consumers     | Shared packages expose package-wide peers for export-specific runtimes, synthetic smoke tests do not exercise real sibling consumers, npm tarballs include repository internals, and releases do not enforce a tag/version/consumer compatibility contract. | Define peers per consumer through optional peers or package splits, add release-only real-consumer matrices, whitelist published files, verify packed artifacts, enforce tag equals package version, and document SemVer/support expectations. |
| GOV-113 | P2  | Todo   | Documentation | All active starter repositories          | READMEs explain how to run the starters but generally do not explain how to adopt, rename, trim, and productionize them or where the support boundary ends. | Add a short "After creating from this template" checklist, rename/removal map, non-goals, deployment decision points, security/compliance disclaimer, and snapshot-versus-upgrade policy without turning READMEs into portfolio governance documents. |
| GOV-114 | P2  | Todo   | Community | Public repositories                      | Public repos accept issues and publish packages but have no shared security reporting, contribution, conduct, or support policy. | Create a public `teo-garcia/.github` repository providing default `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SUPPORT.md`; keep repo-specific overrides only where behavior differs. |
| GOV-115 | P2  | Todo   | Testing | Active app templates                     | Playwright smoke tests are local-only, and React configs can silently reuse an unrelated process on port 3000, producing false test targets; template generation/adoption is not smoke-tested. | Use CI-safe server ownership (`reuseExistingServer` only outside CI), assign isolated ports, run one bounded Playwright smoke in CI or a documented scheduled lane, and add a lightweight generated-template/adoption smoke where GitHub-template behavior matters. |
