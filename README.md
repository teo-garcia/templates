<div align="center">

# Templates

**Production-ready starters, shared configuration packages, and local platform
stacks for building consistent applications**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Git submodules](https://img.shields.io/badge/Git-submodules-F05032?logo=git&logoColor=white)](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

Maintained by [@teo-garcia](https://github.com/teo-garcia)

</div>

---

## Available templates

| Lane    | Repository                                                           |
| ------- | -------------------------------------------------------------------- |
| Web     | [`next-template-fullstack`](next-template-fullstack)                 |
| Web     | [`react-router-template-fullstack`](react-router-template-fullstack) |
| Web     | [`tanstack-template-fullstack`](tanstack-template-fullstack)         |
| Web     | [`astro-template-fullstack`](astro-template-fullstack)               |
| Mobile  | [`expo-template-mobile`](expo-template-mobile)                       |
| Backend | [`nest-template-monolith`](nest-template-monolith)                   |
| Backend | [`fastapi-template-monolith`](fastapi-template-monolith)             |
| Backend | [`django-template-monolith`](django-template-monolith)               |
| Backend | [`adonis-template-monolith`](adonis-template-monolith)               |
| Backend | [`spring-template-monolith`](spring-template-monolith)               |
| Backend | [`gin-template-monolith`](gin-template-monolith)                     |

## Shared tooling

| Ecosystem     | Packages                                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript    | [`eslint-config-shared`](eslint-config-shared), [`prettier-config-shared`](prettier-config-shared), [`tsconfig-shared`](tsconfig-shared), [`vitest-config-shared`](vitest-config-shared) |
| Python        | [`ruff-config-shared`](ruff-config-shared), [`mypy-config-shared`](mypy-config-shared), [`pytest-config-shared`](pytest-config-shared)                                                   |
| Go            | [`golangci-config-shared`](golangci-config-shared), [`gotest-config-shared`](gotest-config-shared)                                                                                       |
| Observability | [`observability-template-stack`](observability-template-stack)                                                                                                                           |

### Compatibility and release consumers

Shared package releases are checked as built artifacts inside representative
Active templates. The package repositories still own their complete synthetic
preset matrices; these consumers prove that the packages also compose in real
applications.

| Package                  | Supported baseline                                               | Release consumer            |
| ------------------------ | ---------------------------------------------------------------- | --------------------------- |
| `eslint-config-shared`   | Node 24+, ESLint 10, and the peer ranges declared by the package | `next-template-fullstack`   |
| `prettier-config-shared` | Node 24+ and Prettier 3                                          | `next-template-fullstack`   |
| `tsconfig-shared`        | Node 24+; preset-specific framework and TypeScript requirements  | `next-template-fullstack`   |
| `vitest-config-shared`   | Node 24+, Vitest 4, and Vite/React peers declared by the package | `next-template-fullstack`   |
| `ruff-config-shared`     | Python 3.12+ and Ruff 0.8+                                       | `fastapi-template-monolith` |
| `mypy-config-shared`     | Python 3.12+ and mypy 1.14+                                      | `fastapi-template-monolith` |
| `pytest-config-shared`   | Python 3.12+, pytest 8.3+, and pytest-cov 6+                     | `fastapi-template-monolith` |
| `golangci-config-shared` | Go 1.25.13+ and golangci-lint 2.12+                              | `gin-template-monolith`     |
| `gotest-config-shared`   | Go 1.25.13+                                                      | `gin-template-monolith`     |

Before a package is tagged, update its submodule pointer here and require this
repository's shared-consumer jobs to pass. Node tarballs and Python wheels are
installed into temporary consumer copies; Go consumers use temporary module
replacements. Package release workflows separately verify packed contents and
require a `v<package version>` tag. Go modules require a Go-compatible `v0.x.y`
or `v1.x.y` tag.

### Reusable delivery automation

The portfolio owns reusable GitHub Actions workflows for behavior that should
not vary by framework:

- `reusable-container-verification.yml` builds the caller's production
  Dockerfile and runs its executable `.github/scripts/container-smoke.sh`.
- `reusable-security.yml` scans the caller's filesystem and Dockerfile and
  reviews dependency changes on pull requests.

Calling repositories keep their event and path filters, ecosystem dependency
audit, and framework-specific smoke script. They must pin portfolio workflows
to a full commit SHA. Updating or rolling back the policy is an explicit change
to that SHA; moving branch and tag references are not accepted.

Container publication and provenance use a separate write-capable workflow so
pull-request verification never receives registry or attestation permissions.
That release path remains unfinished until the governance evidence is met.

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

## Portfolio policy

Maintainers can find lifecycle, contracts, and current portfolio work in
[`GOVERNANCE.md`](GOVERNANCE.md).

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
