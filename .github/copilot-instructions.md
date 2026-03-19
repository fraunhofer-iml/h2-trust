# Copilot Instructions for H2-Trust

## Repository Summary

- H2-Trust is a hydrogen product passport system for tracking hydrogen batches, production steps, provenance, and
  compliance across the supply chain.
- It is an Nx monorepo with one Angular frontend, one NestJS BFF, two NestJS RMQ microservices, shared TypeScript
  libraries, Prisma/PostgreSQL persistence, MinIO object storage, RabbitMQ messaging, Keycloak auth, and a separate
  Hardhat smart-contract package.

## Toolchain and Runtime

- CI and this repo expect Node `24.13.x`, npm `11.x`, and Nx `22.5.4`.
- Package manager is `npm`; the root lockfile is
  [package-lock.json](/home/mpichura/projects/duh-it/h2-trust/core/package-lock.json).
- Backing services come from [docker-compose.yaml](/home/mpichura/projects/duh-it/h2-trust/core/docker-compose.yaml):
  PostgreSQL, MinIO, blockchain, Keycloak, RabbitMQ.
- Prisma schema is
  [libs/database/src/lib/schema.prisma](/home/mpichura/projects/duh-it/h2-trust/core/libs/database/src/lib/schema.prisma).

## Layout Quick Map

- Apps:
  - [apps/frontend](/home/mpichura/projects/duh-it/h2-trust/core/apps/frontend): Angular 21 app, main entry
    [apps/frontend/src/main.ts](/home/mpichura/projects/duh-it/h2-trust/core/apps/frontend/src/main.ts)
  - [apps/bff](/home/mpichura/projects/duh-it/h2-trust/core/apps/bff): NestJS REST gateway with Swagger, entry
    [apps/bff/src/main.ts](/home/mpichura/projects/duh-it/h2-trust/core/apps/bff/src/main.ts)
  - [apps/general-svc](/home/mpichura/projects/duh-it/h2-trust/core/apps/general-svc): NestJS RMQ microservice for
    master data
  - [apps/process-svc](/home/mpichura/projects/duh-it/h2-trust/core/apps/process-svc): NestJS RMQ microservice for
    production, bottling, provenance, DPP logic
  - [apps/bff-e2e](/home/mpichura/projects/duh-it/h2-trust/core/apps/bff-e2e): Jest-based backend e2e; currently not a
    reliable default validation target
  - [apps/frontend-e2e](/home/mpichura/projects/duh-it/h2-trust/core/apps/frontend-e2e): Playwright setup for frontend
    e2e
- Shared libs:
  - [libs/api](/home/mpichura/projects/duh-it/h2-trust/core/libs/api): DTOs, labels, shared API types
  - [libs/amqp](/home/mpichura/projects/duh-it/h2-trust/core/libs/amqp): broker queues, payloads, entities, RMQ helpers
  - [libs/configuration](/home/mpichura/projects/duh-it/h2-trust/core/libs/configuration): env/config access used by
    apps
  - [libs/database](/home/mpichura/projects/duh-it/h2-trust/core/libs/database): Prisma schema, query args, seed data
  - [libs/domain](/home/mpichura/projects/duh-it/h2-trust/core/libs/domain): enums and domain-only types
  - [libs/storage](/home/mpichura/projects/duh-it/h2-trust/core/libs/storage): file/object storage abstraction
  - [libs/blockchain](/home/mpichura/projects/duh-it/h2-trust/core/libs/blockchain): blockchain utilities plus separate
    Hardhat package in `libs/blockchain/smart-contract`
  - [libs/utils](/home/mpichura/projects/duh-it/h2-trust/core/libs/utils): generic helpers
- Key repo-level config: [package.json](/home/mpichura/projects/duh-it/h2-trust/core/package.json),
  [nx.json](/home/mpichura/projects/duh-it/h2-trust/core/nx.json),
  [tsconfig.base.json](/home/mpichura/projects/duh-it/h2-trust/core/tsconfig.base.json),
  [eslint.config.mjs](/home/mpichura/projects/duh-it/h2-trust/core/eslint.config.mjs),
  [jest.config.ts](/home/mpichura/projects/duh-it/h2-trust/core/jest.config.ts),
  [.prettierrc](/home/mpichura/projects/duh-it/h2-trust/core/.prettierrc),
  [.editorconfig](/home/mpichura/projects/duh-it/h2-trust/core/.editorconfig),
  [.license-header](/home/mpichura/projects/duh-it/h2-trust/core/.license-header)

## Coding Guidelines

- Always preserve the Apache license header in new `.ts`, `.js`, and `.mjs` files; ESLint enforces it.
- Use 2-space indentation, single quotes, and `printWidth: 120`.
- Imports are auto-sorted by Prettier; prefer existing `@h2-trust/*` path aliases from
  [tsconfig.base.json](/home/mpichura/projects/duh-it/h2-trust/core/tsconfig.base.json) over deep relative imports.
- Keep changes inside the existing app/lib boundaries; Nx module-boundary checks run in ESLint.
- Frontend uses Angular standalone bootstrap and Tailwind; component selector prefix is `app`.
- Do not weaken validation behavior casually: `general-svc` and `process-svc` use strict `ValidationPipe`, while `bff`
  is intentionally less strict for now.

## Validated Setup and Command Order

- Fresh bootstrap always starts with:
  1. `npm ci --no-audit --no-fund`
  2. `npm --prefix libs/blockchain/smart-contract ci --no-audit --no-fund`
- If local env is missing or stale, sync it from
  [\.env.example](/home/mpichura/projects/duh-it/h2-trust/core/.env.example) before debugging anything else. A stale
  `.env` caused two real failures during validation: `docker compose` warned `MINIO_BUCKET_NAME` was unset and Prisma
  pointed to `h2-trust-dev` instead of the compose database.
- For one-off agent validation, the safest pattern is to load the checked-in env explicitly instead of trusting a
  developer-specific `.env`:
  - `set -a && source .env.example && set +a && docker compose up -d`
  - `set -a && source .env.example && set +a && npx prisma db push --schema libs/database/src/lib/schema.prisma --force-reset && npx prisma db seed`
- `npm run setup:db-reset` works only when `.env` is already aligned with `.env.example`.
- `npm run setup` is conceptually correct, but only use it after confirming `.env` is current; otherwise Prisma reset
  fails with authentication errors.

## Validated Build, Run, Lint, and Test Commands

- Build apps exactly as CI does:
  - `set -a && source .env.example && set +a && npx nx run-many -t build --projects=bff,frontend,general-svc,process-svc --parallel --outputStyle=static`
- Build smart contracts separately:
  - `npm --prefix libs/blockchain/smart-contract run build`
- Run development stack:
  - Start services first: `set -a && source .env.example && set +a && docker compose up -d`
  - Then app dev servers: `set -a && source .env.example && set +a && npm run dev`
  - Verified listening ports after startup: frontend `4200`, BFF `3000`, node/Nx service ports `9230`, `9232`, `9233`.
- Lint and format:
  - `npx eslint --quiet .`
  - `npx prettier --check .`
  - Markdown files are included in Prettier checks, including this instructions file.
  - Prettier currently prints noisy false-positive messages about cached Nx project graphs and
    `panic: reflect: unimplemented: AssignableTo with interface` for Dockerfiles; if the command exits `0`, treat it as
    passing.
- Safe default test sequence:
  - `set -a && source .env.example && set +a && npx nx run-many -t test --projects=amqp,bff,frontend,general-svc,process-svc,utils --parallel 5 --outputStyle=static`
  - `npm --prefix libs/blockchain/smart-contract test`

## Known Failure Modes

- Do not use root `npm test` as your default validation command. It currently expands to inferred Jest targets for libs
  with no tests and also includes `bff-e2e`; this failed during validation even though the CI-covered suites passed.
- `bff-e2e` is currently not a reliable default gate. It failed during validation because
  [apps/bff-e2e/src/bff/test-utils/test.utils.ts](/home/mpichura/projects/duh-it/h2-trust/core/apps/bff-e2e/src/bff/test-utils/test.utils.ts)
  truncates tables (`ProcessType`, `EnergySource`) that are not present in the current Prisma schema.
- `npm ci` at root emits a non-fatal peer warning from `@nestjs/swagger` / `@nestjs/mapped-types` about
  `class-validator`; do not treat that as a repo failure.
- Smart-contract dependencies are not covered by the root install. Always run the separate
  `npm --prefix libs/blockchain/smart-contract ...` install/build/test commands when touching blockchain code.

## CI and Validation Pipelines

- Main workflows live in [\.github/workflows](/home/mpichura/projects/duh-it/h2-trust/core/.github/workflows):
  - `build.yml`: builds `bff`, `frontend`, `general-svc`, `process-svc`, then smart contracts
  - `test.yml`: runs `amqp`, `bff`, `frontend`, `general-svc`, `process-svc`, `utils`, plus smart-contract tests
  - `lint-and-format.yml`: runs root ESLint and Prettier checks
  - `danger.yml`: PR hygiene only; checks assignee, non-draft status, PR description, and lockfile updates when
    `package.json` changes
  - `codeql.yml`: JavaScript CodeQL analysis
  - `images.yml`: release-tag image builds using
    [docker/angular.dockerfile](/home/mpichura/projects/duh-it/h2-trust/core/docker/angular.dockerfile) and
    [docker/nest.dockerfile](/home/mpichura/projects/duh-it/h2-trust/core/docker/nest.dockerfile)
  - `slither.yml`: currently disabled (`if: false`)
- If you change `package.json`, also update
  [package-lock.json](/home/mpichura/projects/duh-it/h2-trust/core/package-lock.json) or Danger will flag the PR.

## Existing Documentation and Resources

- [README.md](/home/mpichura/projects/duh-it/h2-trust/core/README.md) is the high-level product overview.
- [documentation/04-deployment-view.adoc](/home/mpichura/projects/duh-it/h2-trust/core/documentation/04-deployment-view.adoc)
  describes intended local setup, but it does not mention the stale-`.env` failure mode discovered during validation.
- [documentation/05-tutorial.adoc](/home/mpichura/projects/duh-it/h2-trust/core/documentation/05-tutorial.adoc) is
  effectively empty; do not rely on it.

## Working Rule for Future Agents

- Trust this file first. Only search the repo when the needed information is missing here or when a command contradicts
  these instructions in the current checkout.
