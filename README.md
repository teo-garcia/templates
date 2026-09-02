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
