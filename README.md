<div align="center">

# Templates

**Production-ready starters, shared configuration packages, and local platform
stacks for building consistent applications**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Git submodules](https://img.shields.io/badge/Git-submodules-F05032?logo=git&logoColor=white)](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

Maintained by [@teo-garcia](https://github.com/teo-garcia)

</div>

---

## Portfolio

| Lane | Repository | Status |
| --- | --- | --- |
| Web | [`next-template-fullstack`](next-template-fullstack) | Active |
| Web | [`react-router-template-fullstack`](react-router-template-fullstack) | Active |
| Web | [`tanstack-template-fullstack`](tanstack-template-fullstack) | Active |
| Web | [`astro-template-fullstack`](astro-template-fullstack) | Active |
| Web | [`angular-template-fullstack`](angular-template-fullstack) | Planned |
| Mobile | [`expo-template-mobile`](expo-template-mobile) | Active |
| Backend | [`nest-template-monolith`](nest-template-monolith) | Active |
| Backend | [`nest-template-microservice`](nest-template-microservice) | Active |
| Backend | [`fastapi-template-monolith`](fastapi-template-monolith) | Active |
| Backend | [`fastapi-template-microservice`](fastapi-template-microservice) | Active |
| Backend | [`django-template-monolith`](django-template-monolith) | Active |
| Backend | [`adonis-template-monolith`](adonis-template-monolith) | Active |
| Shared config | [`eslint-config-shared`](eslint-config-shared) | Active |
| Shared config | [`prettier-config-shared`](prettier-config-shared) | Active |
| Shared config | [`tsconfig-shared`](tsconfig-shared) | Active |
| Shared config | [`vitest-config-shared`](vitest-config-shared) | Active |
| Shared config | [`ruff-config-shared`](ruff-config-shared) | Active |
| Shared config | [`mypy-config-shared`](mypy-config-shared) | Active |
| Shared config | [`pytest-config-shared`](pytest-config-shared) | Active |
| Platform | [`microservices-template-stack`](microservices-template-stack) | Active |
| Platform | [`observability-template-stack`](observability-template-stack) | Active |
| Platform | [`terraform-template-baseline`](terraform-template-baseline) | Incubating |
| Platform | [`helm-template-baseline`](helm-template-baseline) | Incubating |

Archived packages remain available under [`archived/`](archived). Lifecycle
decisions and planned repositories are tracked in the [roadmap](ROADMAP.md).

---

## Requirements

- Git 2.31+
- The runtime and tooling required by the template you plan to use

---

## Quick Start

```bash
git clone --recurse-submodules https://github.com/teo-garcia/templates.git
cd templates
git submodule status
```

If the repository was cloned without submodules:

```bash
git submodule update --init --recursive
```

Each directory is an independent repository. Before making changes inside one,
switch it from the pinned commit to its working branch:

```bash
cd next-template-fullstack
git switch main
```

After updating a child repository, commit and push there first. Then commit the
updated submodule pointer in this repository.

---

## Portfolio Documents

| Document | Purpose |
| --- | --- |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Stable portfolio standards and decision rules |
| [`ROADMAP.md`](ROADMAP.md) | Priorities, planned work, and open design questions |
| [`PARITY.md`](PARITY.md) | Observable contracts shared across template families |
| [`LEARNING_PROJECTS.md`](LEARNING_PROJECTS.md) | Project ideas for exercising the templates |

---

## Repository Model

This is a portfolio repository, not a monorepo. Git submodules preserve each
template's independent history, releases, CI, issues, and versioning while this
repository records one reproducible portfolio snapshot.

---

## License

MIT

---

<div align="center">
  <sub>Built by <a href="https://github.com/teo-garcia">teo-garcia</a></sub>
</div>
