# Templates Roadmap

Planning and sequencing for the `@teo-garcia` templates ecosystem live here.
Stable standards and decision rights remain in [`GOVERNANCE.md`](GOVERNANCE.md).

## Document Meta

- Last updated: `2026-08-19`
- Owner: `@teo-garcia`

## Current Priorities

1. Establish the `templates` portfolio repository and pin every existing child
   repository through Git submodules.
2. Close active-repository baseline gaps before adding more framework families.
3. Finish the framework-neutral HTTP and async contracts for backend
   microservice templates.
4. Reduce portfolio maintenance drift through mechanical checks and consistent
   GitHub repository policy.

Detailed governed work remains identified by `GOV-*` entries in
[`GOVERNANCE.md`](GOVERNANCE.md). This document owns prioritization; governance
owns the rules and acceptance boundaries.

## Planned Repositories

| Repository | Intent |
| --- | --- |
| `django-template-microservice` | Django service under the governed microservice baseline |
| `adonis-template-microservice` | AdonisJS service under the governed microservice baseline |
| `click-template-layered` | Layered Python CLI starter |
| `commander-template-layered` | Layered TypeScript CLI starter |

`angular-template-fullstack` has a local scaffold but remains planned until its
portfolio acceptance work is complete.

## Incubating Platform Work

### Terraform baseline

The first implementation should target one cloud provider and prove a small,
composable contract for networking, IAM, secrets, DNS, and managed Postgres.
Before scaffolding, decide:

- AWS or GCP as the first supported provider.
- Remote-state and plan-review ownership.
- Which resources are genuinely reusable across projects.
- Root-module versus small-module composition.

### Helm baseline

The first implementation should build on the existing container, health, and
shutdown contracts without hiding Kubernetes primitives. Before scaffolding,
decide:

- The default ingress controller and how consumers override it.
- Secret injection and whether External Secrets Operator is assumed.
- Library chart versus a thin deployable application chart.
- The first real application deployment that will validate the abstraction.

## Expansion Rule

Do not promote an incubating or planned repository to active until it has a
documented contract, an independent remote, a reproducible verification command,
and at least one real consumer or adoption path.
