# Copilot Instructions for H2-Trust

## Repository Summary

- H2-Trust is a hydrogen product passport system for tracking hydrogen batches, production steps, provenance, and
  compliance across the supply chain.
- It is an Nx monorepo with one Angular frontend, one NestJS BFF, two NestJS RMQ microservices, shared TypeScript
  libraries, Prisma/PostgreSQL persistence, MinIO object storage, RabbitMQ messaging, Keycloak auth, and a separate
  Hardhat smart-contract package.

## Toolchain and Runtime

- CI and this repo expect Node `24.13.x`, npm `11.x`, and Nx `22.7.2`.
- Package manager is `npm`; the root lockfile is [package-lock.json](./package-lock.json).
- Backing services come from [docker-compose.yaml](./docker-compose.yaml): PostgreSQL, MinIO, blockchain, Keycloak,
  RabbitMQ.
- Prisma schema is [libs/database/src/lib/schema.prisma](./libs/database/src/lib/schema.prisma).

## Layout Quick Map

- Apps:
  - [apps/frontend](./apps/frontend): Angular 21 app, main entry
    [apps/frontend/src/main.ts](./apps/frontend/src/main.ts)
  - [apps/bff](./apps/bff): NestJS REST gateway with Swagger, entry [apps/bff/src/main.ts](./apps/bff/src/main.ts)
  - [apps/general-svc](./apps/general-svc): NestJS RMQ microservice for master data
  - [apps/process-svc](./apps/process-svc): NestJS RMQ microservice for production, bottling, provenance, DPP logic
  - [apps/frontend-e2e](./apps/frontend-e2e): Playwright setup for frontend e2e (not part of current CI test gate)
- Shared libs:
  - [libs/contracts](./libs/contracts): DTOs, entities, and payloads shared between apps; path aliases
    `@h2-trust/contracts/dtos`, `@h2-trust/contracts/entities`, `@h2-trust/contracts/payloads`
  - [libs/messaging](./libs/messaging): broker queues, message patterns, RMQ helpers; path alias `@h2-trust/messaging`
  - [libs/exceptions](./libs/exceptions): typed exception hierarchy (app, blockchain, database, domain, internal,
    storage, validation); path alias `@h2-trust/exceptions`
  - [libs/configuration](./libs/configuration): env/config access used by apps; path alias `@h2-trust/configuration`
  - [libs/database](./libs/database): Prisma schema, query args, seed data; path alias `@h2-trust/database`
  - [libs/domain](./libs/domain): enums and domain-only types; path alias `@h2-trust/domain`
  - [libs/storage](./libs/storage): file/object storage abstraction; path alias `@h2-trust/storage`
  - [libs/strings](./libs/strings): enum label mappers; path alias `@h2-trust/strings`
  - [libs/validation](./libs/validation): custom class-validator validators; path alias `@h2-trust/validation`
  - [libs/blockchain](./libs/blockchain): blockchain utilities plus separate Hardhat package in
    `libs/blockchain/smart-contract`; path alias `@h2-trust/blockchain`
  - [libs/utils](./libs/utils): generic helpers; path alias `@h2-trust/utils`
- Key repo-level config: [package.json](./package.json), [nx.json](./nx.json),
  [tsconfig.base.json](./tsconfig.base.json), [eslint.config.mjs](./eslint.config.mjs),
  [jest.config.ts](./jest.config.ts), [.prettierrc](./.prettierrc), [.editorconfig](./.editorconfig),
  [.license-header](./.license-header)

## Coding Guidelines

- Always preserve the Apache license header in new `.ts`, `.js`, and `.mjs` files; ESLint enforces it.
- Use 2-space indentation, single quotes, and `printWidth: 120`.
- Imports are auto-sorted by Prettier; prefer existing `@h2-trust/*` path aliases from
  [tsconfig.base.json](./tsconfig.base.json) over deep relative imports.
- Import order from [\.prettierrc](./.prettierrc): built-ins, third-party, `@h2-trust/*`, `../`, then `./`.
- Keep changes inside the existing app/lib boundaries; Nx module-boundary checks run in ESLint.
- Frontend uses Angular standalone bootstrap and Tailwind CSS 4.
- Do not weaken validation behavior casually: `general-svc` and `process-svc` use strict `ValidationPipe`, while `bff`
  is intentionally less strict for now.
- Danger enforces Conventional Commits in PR titles (`build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`,
  `revert`, `style`, `test`) and labels PRs from the detected type.
- Danger warns if a `feat` PR has no `.spec.ts` changes.
- If `.sol` files change, also update smart-contract artifacts under `docker/` (run `npx hardhat compile`) to avoid
  Danger warnings.
- For blockchain code, always wrap `Wallet` in `NonceManager` from ethers.js; parallel transactions cause nonce
  conflicts otherwise.
- Never import `@h2-trust/contracts/*/fixtures` in production code — fixtures are test-only and ESLint blocks it.

## Validated Setup and Command Order

- Fresh bootstrap always starts with:
  1. `npm ci --no-audit --no-fund`
  2. `npm --prefix libs/blockchain/smart-contract ci --no-audit --no-fund`
- If local env is missing or stale, sync it from [\.env.example](./.env.example) before debugging anything else. A stale
  `.env` caused two real failures during validation: `docker compose` warned `MINIO_BUCKET_NAME` was unset and Prisma
  pointed to `h2-trust-dev` instead of the compose database.
- For one-off agent validation, the safest pattern is to load the checked-in env explicitly instead of trusting a
  developer-specific `.env`:
  - `set -a && source .env.example && set +a && docker compose up -d`
  - `set -a && source .env.example && set +a && npx prisma db push --schema libs/database/src/lib/schema.prisma --force-reset && npx prisma db seed`
- `npm run setup:db-reset` works only when `.env` is already aligned with `.env.example`.
- `npm run setup` is conceptually correct, but only use it after confirming `.env` is current; otherwise Prisma reset
  fails with authentication errors.
- `FEATURE_VERIFICATION_ENABLED` in [\.env.example](./.env.example) gates IPFS/blockchain verification integration; when
  disabled, those backing services are not required for normal flows.

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
  - Auto-fix helpers from [package.json](./package.json): `npm run quality`, `npm run quality:format`,
    `npm run quality:lint`
  - Markdown files are included in Prettier checks, including this instructions file.
  - Prettier currently prints noisy false-positive messages about cached Nx project graphs and
    `panic: reflect: unimplemented: AssignableTo with interface` for Dockerfiles; if the command exits `0`, treat it as
    passing.
- Safe default test sequence (matches CI exactly):
  - `set -a && source .env.example && set +a && npx nx run-many -t test --projects=bff,frontend,general-svc,process-svc,utils --parallel 5 --outputStyle=static`
  - `npm --prefix libs/blockchain/smart-contract test`
  - Do not use root `npm test` — it expands to inferred Jest targets for all projects including libs with no tests.
- Smart-contract dependencies are not covered by the root install; always run the separate
  `npm --prefix libs/blockchain/smart-contract ...` install/build/test commands when touching blockchain code.

## CI and Validation Pipelines

- Main workflows live in [\.github/workflows](./workflows):
  - `build.yml`: builds `bff`, `frontend`, `general-svc`, `process-svc`, then smart contracts
  - `test.yml`: runs `bff`, `frontend`, `general-svc`, `process-svc`, `utils`, plus smart-contract tests
  - `lint-and-format.yml`: runs root ESLint and Prettier checks
  - `danger.yml`: PR hygiene only; checks assignee, non-draft status, PR description, and lockfile updates when
    `package.json` changes
  - `codeql.yml`: JavaScript CodeQL analysis
  - `images.yml`: release-tag image builds using [docker/angular.dockerfile](./docker/angular.dockerfile) and
    [docker/nest.dockerfile](./docker/nest.dockerfile)
  - `dependabot.yml`: auto-labels, auto-approves, and enables auto-merge for patch/minor Dependabot PRs
  - `slither.yml`: currently disabled (`if: false`)
- If you change `package.json`, also update [package-lock.json](./package-lock.json) or Danger will flag the PR.

## Agent Behavior Rules

- **Ask, never guess.** If a requirement is ambiguous, a file path is unknown, or behavior is unclear, stop and ask one
  targeted clarifying question before proceeding. Do not invent assumptions and proceed silently.
- **State blockers explicitly.** If you cannot complete a step because information is missing or a command fails
  unexpectedly, report the specific blocker immediately rather than working around it.
- **Do not speculate about intent.** If the task description could be interpreted in more than one way, present the
  interpretations and ask which is correct.
- **Scope creep is a blocker too.** If completing a task would require touching code or systems outside the explicit
  scope, flag this before making those changes.
- **Trust this file first.** Only search the repo when the needed information is missing here or when a command
  contradicts these instructions in the current checkout.
- **Treat each issue as a prompt.** If an issue or task lacks a clear problem description and acceptance criteria, ask
  for them before starting work.
- **Check `.github/instructions/`** for supplementary instruction files when working on Angular components or NestJS
  modules.

## Task Scope

Suitable for autonomous completion:

- Bug fixes with a clear reproduction case
- Test coverage additions or improvements
- Documentation updates
- Style, formatting, or linting fixes
- Isolated feature additions within a single app or lib boundary

Require explicit human confirmation before proceeding:

- Cross-app refactors or renames that span more than two packages
- Any change to authentication, authorization (`Keycloak`), or token handling
- Schema migrations (`schema.prisma` changes) — these require a follow-up `prisma migrate`
- Smart-contract changes — always rebuild artifacts under `docker/` with `npx hardhat compile`
- Changes to CI workflow files in [\.github/workflows](./workflows)
- Any task where the acceptance criteria are not explicitly stated in the issue or prompt

## Code Generation Patterns

### NestJS Feature Module (microservices: `general-svc`, `process-svc`)

Each feature lives in `src/app/{feature}/` and consists of four files:

```
{feature}.module.ts    — @Module wiring
{feature}.controller.ts — @MessagePattern handlers (no HTTP verbs)
{feature}.service.ts   — business logic, delegates to repository
{feature}.controller.spec.ts — Jest tests
```

Module imports `DatabaseModule` when the feature needs a repository, and lists controller and service:

```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

Controller uses `@MessagePattern` with the typed enum from `@h2-trust/messaging`, returns `Entity` types:

```typescript
@Controller()
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @MessagePattern(FeatureMessagePatterns.READ)
  findAll(): Promise<FeatureEntity[]> {
    return this.service.findAll();
  }
}
```

Service injects the repository from `@h2-trust/database`:

```typescript
@Injectable()
export class FeatureService {
  constructor(private readonly repository: FeatureRepository) {}
}
```

### NestJS BFF Controller (REST)

Use `@Controller('resource')` with HTTP method decorators. Always add Swagger decorators (`@ApiBearerAuth`,
`@ApiOperation`, `@ApiOkResponse`, `@ApiParam`). Return **DTO** types, not entities.

### Configuration

Use `ConfigurationService` from `@h2-trust/configuration`, never inject `ConfigService` from `@nestjs/config` directly.
Access config via typed methods: `configuration.getGlobalConfiguration()`, `configuration.getBffConfiguration()`,
`configuration.getProcessSvcConfiguration()`, etc.

### Repository Pattern

Repositories live in `@h2-trust/database` and inject `PrismaService`. Wrap every Prisma call with
`.catch(wrapPrismaError)`:

```typescript
@Injectable()
export class FeatureRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<FeatureEntity[]> {
    return this.prismaService.feature.findMany().catch(wrapPrismaError);
  }
}
```

### DTO / Entity / Payload Distinction

| Type       | Location                       | Used in                                          |
| ---------- | ------------------------------ | ------------------------------------------------ |
| `*Dto`     | `@h2-trust/contracts/dtos`     | BFF HTTP responses and requests; frontend        |
| `*Entity`  | `@h2-trust/contracts/entities` | Microservice return values; mapping from DB      |
| `*Payload` | `@h2-trust/contracts/payloads` | RPC call arguments between BFF and microservices |

Map from Prisma results to entities with static factory methods: `Entity.fromDeepDatabase()`,
`Entity.fromNestedDatabase()`, or `Entity.fromFlatDatabase()`.

### Exception Hierarchy

Throw the narrowest exception from `@h2-trust/exceptions`. See
[nestjs-module.instructions.md](./instructions/nestjs-module.instructions.md) for the full list with usage guidance.

## Frontend Conventions

- Components are standalone by default in Angular 21. Always use `selector: 'app-{name}'`.
- In Angular components, use `inject()` for dependency injection, not constructor injection.
- Fetch data with **TanStack Query** (`injectQuery`, `injectMutation` from `@tanstack/angular-query-experimental`).
  Define query options in `src/app/shared/queries/{domain}.query.ts`.
- Import only from `@h2-trust/contracts/dtos` — ESLint blocks `@h2-trust/contracts/entities` and
  `@h2-trust/contracts/payloads` in the frontend.
- Use Angular Material components for UI and Tailwind CSS 4 for layout and utility styles.
- Use signals (`signal()`, `computed()`) and `inject(DestroyRef)` with `takeUntilDestroyed` for reactive cleanup.

## Testing Conventions

- Test files are named `{name}.spec.ts` and live next to the source file.
- Use `@nestjs/testing` `Test.createTestingModule()` with `useValue` to mock dependencies:

```typescript
const module: TestingModule = await Test.createTestingModule({
  imports: [DatabaseModule],
  controllers: [FeatureController],
  providers: [FeatureService, { provide: PrismaService, useValue: { feature: { findMany: jest.fn() } } }],
}).compile();
```

- Use fixtures from `@h2-trust/contracts/*/fixtures` only in test files — ESLint blocks them in production code.
- Every `describe` block must have at minimum an `it('should be defined')` baseline test.
- For Angular, use `jest-preset-angular` (already configured); no need to configure `TestBed` from scratch.
