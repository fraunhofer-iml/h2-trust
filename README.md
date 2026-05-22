# H2-Trust

[![Build](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/build.yml/badge.svg)](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/build.yml)
[![Test](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/test.yml/badge.svg)](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/test.yml)
[![Lint and Format](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/lint-and-format.yml/badge.svg)](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/lint-and-format.yml)
[![CodeQL](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/codeql.yml/badge.svg)](https://github.com/fraunhofer-iml/h2-trust/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/fraunhofer-iml/h2-trust)](LICENSE)

H2-Trust is a hydrogen product passport platform for tracking hydrogen batches, documenting process steps, and verifying
provenance and supporting evidence across the supply chain.

It is maintained by Fraunhofer IML as part of the DUH-IT research project and is implemented as an Nx monorepo with an
Angular frontend, NestJS services, shared TypeScript libraries, and a smart-contract package.

## Table of Contents

- [Why H2-Trust](#why-h2-trust)
- [Architecture at a glance](#architecture-at-a-glance)
- [Technology stack](#technology-stack)
- [Quick start](#quick-start)
- [Common commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Why H2-Trust

- Track hydrogen-related master data, batches, and process steps in one system.
- Keep supporting evidence accessible through object storage and verification workflows.
- Combine a web frontend with service-based backend processing and asynchronous messaging.
- Support tamper-resistant verification scenarios with blockchain and decentralized storage integrations.

## Architecture at a glance

### Applications

- [`apps/frontend`](./apps/frontend) – Angular web application for end users
- [`apps/bff`](./apps/bff) – NestJS backend-for-frontend and REST API entry point
- [`apps/general-svc`](./apps/general-svc) – NestJS microservice for master data
- [`apps/process-svc`](./apps/process-svc) – NestJS microservice for production, bottling, provenance, and
  product-passport workflows
- [`libs/blockchain/smart-contract`](./libs/blockchain/smart-contract) – smart-contract package used for verification
  scenarios

### Shared libraries

- [`libs/contracts`](./libs/contracts) – shared DTOs, entities, and contracts
- [`libs/messaging`](./libs/messaging) – RabbitMQ queue definitions and messaging helpers
- [`libs/database`](./libs/database) – Prisma schema, database access, and seed data
- [`libs/storage`](./libs/storage) – storage abstraction and implementations
- [`libs/configuration`](./libs/configuration) – environment and runtime configuration
- [`libs/domain`](./libs/domain), [`libs/strings`](./libs/strings), [`libs/utils`](./libs/utils),
  [`libs/validation`](./libs/validation), [`libs/exceptions`](./libs/exceptions) – shared domain, utility, validation,
  and exception helpers

### Backing services used locally

- PostgreSQL
- RabbitMQ
- MinIO
- Keycloak
- Local blockchain node
- IPFS (for verification-related scenarios)

## Technology stack

- Angular 21
- NestJS 11
- Nx
- TypeScript
- Prisma + PostgreSQL
- RabbitMQ
- Keycloak
- MinIO
- Hardhat / Ethers
- Docker Compose

## Quick start

### Prerequisites

- Node.js 24.13.x
- npm 11.x
- Docker with Docker Compose
- Git

### Local setup

The commands below assume a Unix-like shell.

```bash
git clone https://github.com/fraunhofer-iml/h2-trust.git
cd h2-trust
cp .env.example .env
npm ci --no-audit --no-fund
npm --prefix libs/blockchain/smart-contract ci --no-audit --no-fund
set -a && source .env && set +a && docker compose up -d
set -a && source .env && set +a && npm run setup
set -a && source .env && set +a && npm run dev
```

### Default local entry points

- Frontend: <http://localhost:4200>
- BFF / REST API: <http://localhost:3000>
- Swagger UI: <http://localhost:3000/api>
- Keycloak: <http://localhost:8080>
- MinIO console: <http://localhost:9090>
- RabbitMQ management: <http://localhost:15672>

### Default demo users

| Role              | Username | Password |
| ----------------- | -------- | -------- |
| Power Producer    | `petra`  | `petra`  |
| Hydrogen Producer | `hannes` | `hannes` |

## Common commands

```bash
# start all application services in development mode
npm run dev

# run the main CI-aligned builds
npx nx run-many -t build --projects=bff,frontend,general-svc,process-svc --parallel
npm --prefix libs/blockchain/smart-contract run build

# run the main CI-aligned test suites
npx nx run bff:test
npx nx run frontend:test
npx nx run general-svc:test
npx nx run process-svc:test
npx nx run utils:test
npm --prefix libs/blockchain/smart-contract test

# run repository formatting and lint checks
npx eslint --quiet .
npx prettier --check .
```

## Troubleshooting

**`docker compose` warnings or Prisma auth errors after fresh clone** The most common cause is a stale or missing
`.env`. Copy `.env.example` and verify it is up to date before running `docker compose up` or any `npm run` commands. A
mismatched `.env` caused `MINIO_BUCKET_NAME` warnings and Prisma pointing to the wrong database in past setups.

**Smart-contract dependencies missing** `npm ci` at the repository root does _not_ install the smart-contract package.
Always run the separate install step when touching blockchain code:

```bash
npm --prefix libs/blockchain/smart-contract ci --no-audit --no-fund
```

## Documentation

- [`documentation/04-deployment-view.adoc`](./documentation/04-deployment-view.adoc) – deployment and setup walkthrough
- [`documentation/index.adoc`](./documentation/index.adoc) – entry point for the architecture documentation set

## Contributing

Contributions, bug reports, and improvement suggestions are welcome.

- Open an issue for bugs, questions, or enhancement ideas.
- Open a pull request for focused, reviewable changes.
- Keep changes within the existing Nx app/library boundaries when possible.

**Code style**

- 2-space indentation, single quotes, `printWidth: 120` (enforced by Prettier).
- All `.ts`, `.js`, and `.mjs` files must carry the Apache 2.0 license header (enforced by ESLint).

**Pull request requirements**

- Assign yourself before marking the PR ready for review.
- Fill in the PR description — empty descriptions are flagged by CI.
- If you change `package.json`, also update `package-lock.json`; CI will flag a missing lockfile update.

## License

This project is licensed under the Apache License 2.0. See [`LICENSE`](./LICENSE).

## Contact

- Dominik Sparer – <dominik.sparer@iml.fraunhofer.de>
- Michael Pichura – <michael.pichura@iml.fraunhofer.de>

## Acknowledgments

- [`wait-for-it`](https://github.com/vishnubob/wait-for-it) is included under the MIT License.
