# Templates Governance

This is the only human-authored control document for the `@teo-garcia`
template portfolio. It defines the supported portfolio, observable contracts,
accepted exceptions, active work, and the evidence required to change them.

Repository `README.md` files are product and adoption documentation. They may
describe what a template does and how to use it, but they do not define
portfolio policy, lifecycle, parity, priorities, or completion state.

Code, lockfiles, tests, CI results, repository settings, and automation
dashboards are operational evidence. When prose and executable evidence
disagree, the discrepancy is active work; prose must never be used to declare
an unverified implementation complete.

## Authority and intent

- Owner and final decision maker: `@teo-garcia`.
- Optimize for delivery speed, predictable operations, low cognitive overhead,
  and maintainable templates rather than maximum feature count.
- Standardize observable behavior while preserving framework-native design.
- Keep shared packages limited to development tooling and configuration until
  repeated runtime reuse is demonstrated.
- Prefer small, reversible changes backed by an executable check.
- Git history records completed work. This file contains no completion log.

## Lifecycle and current scope

| Lifecycle  | Meaning                                                                                                                                | Portfolio gates      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Active     | Supported and expected to satisfy its lane contracts.                                                                                  | Required             |
| Paused     | Preserved but receiving no feature, parity, expansion, or modernization work. Critical security and reproducibility fixes are allowed. | Exempt until resumed |
| Planned    | Accepted direction without a supported release commitment.                                                                             | Exempt               |
| Incubating | Exploration whose contract is not yet approved.                                                                                        | Exempt               |
| Archived   | Frozen historical reference with automation disabled and no new consumers.                                                             | Exempt               |

### Active repositories

| Lane                     | Repositories                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Web                      | `next-template-fullstack`, `react-router-template-fullstack`, `tanstack-template-fullstack`, `astro-template-fullstack`                                            |
| Mobile                   | `expo-template-mobile`                                                                                                                                             |
| Backend monolith         | `nest-template-monolith`, `adonis-template-monolith`, `fastapi-template-monolith`, `django-template-monolith`, `spring-template-monolith`, `gin-template-monolith` |
| TypeScript shared config | `eslint-config-shared`, `prettier-config-shared`, `tsconfig-shared`, `vitest-config-shared`                                                                        |
| Python shared config     | `ruff-config-shared`, `mypy-config-shared`, `pytest-config-shared`                                                                                                 |
| Go shared config         | `golangci-config-shared`, `gotest-config-shared`                                                                                                                   |
| Platform                 | `observability-template-stack`                                                                                                                                     |

### Microservice pause

Effective `2026-09-02`, all microservice development is paused. The pause
includes existing repositories, their orchestration stack, and proposed
framework expansions:

- `nest-template-microservice`
- `fastapi-template-microservice`
- `spring-template-microservice`
- `microservices-template-stack`
- proposed Django, AdonisJS, and Gin microservice templates

Paused microservice repositories remain available for reference, but they do
not block active-portfolio stability and must not receive new architecture,
contract, parity, framework, deployment, or dependency-modernization work.
Critical security fixes and changes required to keep an existing checkout
reproducible are allowed. Resuming microservice development requires an
explicit governance change that names the bounded outcome and its verification
gate.

### Other lifecycle states

| Lifecycle  | Repositories or directions                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Planned    | `angular-template-fullstack`, `click-template-layered`, `commander-template-layered`, AI/LLM reference application |
| Incubating | `terraform-template-baseline`, `helm-template-baseline`                                                            |
| Archived   | `archived/react-shared`, `archived/react-native-shared`, `archived/ts-core`, `archived/python-core`                |

Do not promote a planned or incubating repository to Active until it has an
independent remote, a reproducible verification command, a documented
observable contract, and a concrete adoption path.

## Required verification gates

Each Active repository must provide one canonical local check matching its CI
gate. Restores use the committed lockfile and production builds must be
reproducible from a clean checkout.

On managed workstations, agents must not install, remove, downgrade, or switch
the host JDK. Java gates use the IT-approved patched JDK already present; when
none is configured, use repository containers and CI. Containerized checks
must record the resolved `java -version`, and any host JDK change requires
explicit owner and IT approval.

| Family                | Required local gate                                                              |
| --------------------- | -------------------------------------------------------------------------------- |
| Node.js application   | `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`                     |
| Python application    | `uv sync --frozen`, `make check`, `make build`                                   |
| Java application      | `make check`, `make build`                                                       |
| Go application        | `make check`, `make build`; integration tests remain an explicit additional gate |
| Node.js shared config | `pnpm install --frozen-lockfile`, `pnpm check`, packed-artifact verification     |
| Python shared config  | `uv sync --frozen`, lint, format check, package build, and installed CLI smoke   |
| Go shared config      | `make check` and consumer smoke where the package exposes a tool                 |
| Compose platform      | `make check`                                                                     |

Portfolio verification must additionally prove:

- every submodule is initialized, classified, and reachable through the
  documented clone path;
- Active repositories contain their required manifests, lockfiles, CI,
  security workflow, license, product README, and runtime assets;
- Compose files render without errors, and production images build;
- a fresh checkout does not depend on untracked local files or host-installed
  databases, caches, or brokers;
- local `check` and CI cover the same contract, or the difference is explicit;
- shared configuration packages are tested against real consumers before
  release;
- repository lifecycle, GitHub settings, and dependency automation agree.

## Observable contracts

### All application templates

- Environment input is validated at startup and secrets are never committed.
- External services run through Compose for local development.
- Development and production start paths are documented and reproducible.
- Logs are structured in production and include a request or correlation ID
  where requests exist.
- Health checks, shutdown behavior, and operational failures are observable.
- CI runs the canonical check and production build; checks may not be disabled
  to manufacture a passing result.
- Dependency and action updates are reviewed through Renovate under the policy
  below.

### AWS distribution

AWS is the portfolio's single cloud reference. This decision does not prevent a
consumer from choosing another host, but the portfolio does not maintain a
cross-cloud abstraction or claim parity with other providers.

Every Active application must have a checked distribution path that consumes
its canonical build artifact without changing framework internals:

| Profile             | Active consumers                                                                                                                     | Required contract                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Container service   | All six backend monoliths plus `next-template-fullstack`, `react-router-template-fullstack`, and `tanstack-template-fullstack`       | Immutable OCI image, explicit port and health path, environment and secret boundaries, dependency wiring, migration step, and rollback. |
| Static web          | `astro-template-fullstack` and the Expo web export                                                                                    | Versioned static artifact, routing and TLS boundary, cache behavior, configuration injection, health smoke, and atomic rollback.        |
| Native mobile       | Expo iOS and Android                                                                                                                  | Remains owned by Expo-native tooling; AWS distribution work must not claim, publish, or replace native releases.                         |

PostgreSQL and Redis are attached only where the application contract requires
them. Application repositories provide values and smoke fixtures; infrastructure
owns AWS resources, networking, state boundaries, secrets integration, routing,
and teardown. Kubernetes resources are excluded from this profile and governed
separately below.

All required authoring, validation, security scanning, testing, and learning
workflows must run locally with open-source tooling and without cloud
credentials. Repository gates must not contact AWS, run `apply`, create remote
state, or require a paid SaaS product. A cost-bearing AWS component may be
documented only as an explicit production alternative; it is not part of the
default implementation when no generally available no-cost path exists.
Infrastructure configuration must retain an OpenTofu-compatible execution path;
HCP Terraform, Terraform Cloud, and other hosted control planes are optional and
must not be required.

A live AWS deployment is claimed only after an owner-authorized disposable run
fits within an account's currently available no-cost allowance, records the
resources and expected cost, passes the application smoke, and proves teardown.
Offline plans, mocked tests, and local emulation are valuable evidence but must
never be described as a live deployment.

The checked offline baseline now lives in `terraform-template-baseline`: its
default plan creates zero resources, its catalog covers all 11 Active
applications, and mocked plan-only tests exercise every consumer. The three
server-rendered web templates publish immutable images only on explicit `v*`
tags, while Astro and Expo web retain versioned static artifacts. Spring exposes
a finite same-image Flyway runner. This completes the credential-free authoring
slice; the Active work item remains open because no owner-authorized live AWS
matrix, cost record, rollback proof, or teardown proof exists yet.

### Web templates

| Surface      | Contract                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Port         | Development and production start on `3000`.                                                           |
| Health API   | `GET /api/health` returns `status`, `timestamp`, `version`, and dependency `checks` where applicable. |
| Health UI    | Every page exposes pending, resolved, and unreachable states with accessible status text.             |
| Route states | Loading, error with recovery, and not-found behavior use framework-native boundaries.                 |
| Theme        | Web templates provide light, dark, and system modes.                                                  |
| Titles       | Page titles use the `{shortName} &#124; {page}` pattern.                                              |
| Verification | Unit tests, production build, and a Playwright smoke covering the app shell and health behavior.      |

React templates keep components, hooks, and test helpers local. Next.js is the
visual reference, but matching its internal file structure is not required.

### Mobile template

- Expo owns development, export, and native build flows.
- Environment and import aliases agree across TypeScript, Babel, Metro, and
  Expo configuration.
- Health state and product language align with web where the platform permits.
- Theme follows the operating system; a web-style theme switch is not required.
- Native release channels, updates, and crash reporting require an explicit
  decision before production adoption.

### Backend monoliths

Framework implementations may differ, but the public HTTP and operational
surface must match.

PostgreSQL and an ecosystem-native ORM are the persistence baseline. Schema
migrations remain explicit deployment steps owned by dedicated migration tools;
ORM startup must not mutate production schemas.

| Repository                  | ORM                       | Migration tool |
| --------------------------- | ------------------------- | -------------- |
| `nest-template-monolith`    | Prisma                    | Prisma Migrate |
| `adonis-template-monolith`  | Lucid                     | Lucid          |
| `fastapi-template-monolith` | SQLAlchemy                | Alembic        |
| `django-template-monolith`  | Django ORM                | Django         |
| `spring-template-monolith`  | Spring Data JPA/Hibernate | Flyway         |
| `gin-template-monolith`     | GORM                      | golang-migrate |

| Surface       | Contract                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| API           | Versioned REST routes live under `/api/v1`.                                                                                                  |
| Success       | JSON contains `success: true`, request metadata, `data`, and optional pagination metadata.                                                   |
| Failure       | JSON contains `success: false`, `message`, structured `error`, and request metadata.                                                         |
| Unknown route | Returns an error-envelope `404`, never a framework-generated `500`.                                                                          |
| Health        | `/health` and `/health/ready` return the same readiness report; `/health/live` has no dependency checks.                                     |
| Health schema | `status` is `ok`, `degraded`, or `down`; shared checks are `database` and `redis`; non-`ok` readiness returns `503`.                         |
| Documentation | OpenAPI UI is `/docs`; the document is `/openapi.json`; documented success bodies match the envelope.                                        |
| Operations    | `/metrics`, structured logs, traces, request IDs, CORS from environment, security headers, rate limiting, and graceful shutdown are present. |
| Data          | Migrations are explicit, repeatable, deployment-safe, and separate from application startup.                                                 |
| Verification  | The same black-box contract suite runs against every backend family in addition to framework-native tests.                                   |

### Shared configuration packages

- Packages contain configuration and development tooling only, not runtime
  application primitives.
- Public exports, peer requirements, packed contents, and SemVer compatibility
  are explicit.
- Synthetic fixtures do not replace a release-time smoke against a real Active
  consumer.
- A release tag must match the package version and pass packed-artifact checks.

### Observability platform

- The stack validates Compose and provisioned dashboards without requiring an
  application repository.
- Backend metrics, logs, and traces use stable names and bounded-cardinality
  labels that allow one shared dashboard model.
- Template-specific instrumentation remains in the consuming application.
- The required production profile is open-source-first: OpenTelemetry,
  Prometheus-compatible metrics, Loki-compatible logs, Tempo-compatible traces,
  Grafana dashboards, and Alertmanager-compatible routing must work without a
  mandatory hosted observability vendor.
- Cheap operation is an explicit contract, not an assumption. Default retention,
  trace sampling, label cardinality, resource limits, storage growth, and alert
  volume are bounded and documented; a cost estimate and its assumptions are
  reviewed before any live deployment.
- A compact single-node or local profile is the default learning and small-load
  path. High availability, managed storage, and hosted integrations are optional
  production alternatives and must not be required by repository checks.

## Approved exceptions

| Scope                       | Exception                                                                               | Reason and review condition                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `gin-template-monolith`     | Applies response envelopes through explicit responders rather than wrapping middleware. | The wire contract is identical and explicit responders avoid route skip lists. Review only if the public contract changes.      |
| `gin-template-monolith`     | Serves a self-contained OpenAPI page rather than a bundled Swagger UI dependency.       | Avoids an external runtime asset while preserving `/docs` and `/openapi.json`.                                                  |
| `fastapi-template-monolith` | May additionally expose `/redoc`.                                                       | It does not replace the canonical documentation paths.                                                                          |
| `expo-template-mobile`      | Has no manual theme switch.                                                             | Native behavior follows the operating-system color scheme.                                                                      |
| `expo-template-mobile` / `diff@7.0.0` | Accept GHSA-73rr-hh4g-fpgx through `2026-10-05`. | Pinned `eas-cli@23.2.0` runs through `pnpm dlx` and calls `diffLines`; the advisory affects `parsePatch` and `applyPatch`. The CLI is not installed or bundled. Review on any EAS update or by the deadline. |
| `expo-template-mobile` / `uuid@8.3.2`, `11.1.1` | Accept GHSA-w5hq-g745-h8pq and its duplicate through `2026-10-05`. | Pinned `eas-cli@23.2.0` runs through `pnpm dlx`; EAS and its Rudder SDK use v4 generation plus validation helpers, not the vulnerable v3/v5/v6 caller-buffer path. The CLI is not installed or bundled. Review on any EAS update or by the deadline. |
| `expo-template-mobile` / `ts-deepmerge@6.2.0` | Accept GHSA-87mf-gv2c-c62c through `2026-10-05`. | Pinned `eas-cli@23.2.0` runs through `pnpm dlx`; this dependency is used only by the `eas new` project generator and is absent from application runtime. Review on any EAS update or by the deadline. |
| `expo-template-mobile` / `decode-uri-component@0.2.2` | Accept GHSA-vcc3-ghjq-m6fr through `2026-10-05`. | Expo Router pins `query-string@7.1.3` but only calls `stringify`; the vulnerable decoder is not invoked. Forcing `0.5.0` breaks the parent's CommonJS contract. Review on any Expo Router update or by the deadline. |
| Coverage thresholds         | Thresholds may differ by repository.                                                    | Commands, source inclusion, reporters, and honest measurement are shared; a strong suite is not weakened to match a weaker one. |

Exceptions are not defects. Any unlisted failure to meet a required contract is
active work or requires a governance decision before it is accepted.

## Dependency automation

- Active repositories receive immediate security updates, grouped patch/minor
  updates on a predictable schedule, and separately reviewed majors.
- Major updates require dashboard approval and must not be hidden inside a
  general dependency group.
- Shared-config updates are reviewed before consumer updates proceed.
- Renovate concurrency must be explicit and low enough that every open PR can
  be reviewed; inherited defaults are not portfolio policy.
- Paused repositories receive critical security updates only.
- Planned and incubating repositories have dependency automation disabled until
  promotion.
- Archived repositories have Renovate disabled and open automation work closed.
- Repeated configuration belongs in one versioned preset with repository-local
  overrides only when behavior genuinely differs.

## Active work

Only unfinished work appears here. At most three items may be `Now`. When an
item meets its evidence requirement, remove it; do not retain a completed row.
Resume work from the first listed item; items are deliberately ordered so no
separate roadmap is needed.

| Status | Priority | Scope                          | Outcome required                                                                                                                                                                     | Evidence required                                                                                                                                                                                                                              |
| ------ | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Now    | P1       | AWS application distribution   | Turn `terraform-template-baseline` into the AWS reference for every Active application through explicit container-service and static-web profiles; preserve framework-native artifacts, keep native Expo releases separate, and introduce no cross-cloud or paid-only abstraction. | Formatting, validation, linting, security scanning, mocked tests, and deterministic plans pass without credentials for every consumer fixture; an owner-authorized disposable AWS matrix that fits the account's current no-cost allowance proves each app's routing, TLS boundary, secrets, PostgreSQL/Redis wiring where required, migrations, health, rollback, and teardown before live distribution is claimed. |
| Next   | P1       | Production operations          | Extend the observability contract into a deployment-owned, open-source-first production profile with measurable reliability, bounded resource usage, and no mandatory hosted vendor. | Container runtimes export durable metrics, logs, and traces; static distributions expose availability, delivery, and access signals; each profile has an availability/latency SLO, Alertmanager-compatible routing, access controls, retention and sampling limits, cardinality/resource budgets, cost assumptions, and an operator runbook exercised by a failure drill. |
| Next   | P2       | Kubernetes delivery            | Activate `helm-template-baseline` as a separate delivery layer for every container-service consumer, reusing immutable application images and keeping cluster provisioning, static sites, and Expo native releases out of the chart contract. | Chart linting, schema validation, render tests for every consumer, and a disposable local cluster smoke prove probes, configuration and secret wiring, resources, autoscaling, disruption handling, ingress/TLS, migration execution, observability attachment, rollback, and teardown without requiring a paid cluster. |
| Next   | P1       | Microservices resumption       | Resume only the existing NestJS and FastAPI services as a bounded reliability slice; do not add framework variants or business-demo breadth.                                         | Governance pause is explicitly lifted for the slice; deployed NATS interoperability proves transactional publication, idempotent consumption, versioned events, retry, dead-letter and replay behavior, trace propagation, SLOs, and rollback. |
| Next   | P2       | AI reference application       | Build an opt-in reference application from existing templates without adding volatile provider or model dependencies to baseline templates.                                          | One bounded use case proves provider isolation, structured output validation, evaluation fixtures, cost and latency telemetry, secret handling, failure behavior, and a deterministic non-network test path.                                   |

## Change protocol

1. Identify the affected lifecycle, lane, observable contract, and rollback.
2. Add or update the executable check that proves the intended behavior.
3. Make the smallest repository change that satisfies the check.
4. Run the repository gate and the affected portfolio conformance gate.
5. Record only enduring policy or an unfinished gap here.
6. Remove completed work immediately; Git and CI retain the evidence.

No framework family, runtime baseline, package manager, public API contract,
deployment assumption, persistence system, broker, authentication model, or
shared runtime dependency may change without updating this file first.
