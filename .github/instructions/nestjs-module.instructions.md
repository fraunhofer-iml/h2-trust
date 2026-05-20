---
applyTo: 'apps/{bff,general-svc,process-svc}/src/**'
---

# NestJS Module Conventions

## File Layout

One directory per feature under `src/app/{feature}/`:

```
{feature}.module.ts
{feature}.controller.ts
{feature}.service.ts
{feature}.controller.spec.ts   (or {feature}.service.spec.ts)
```

Register the feature module in the nearest `app.module.ts`.

## Module

```typescript
// Apache license header required

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@h2-trust/database';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

Import `DatabaseModule` whenever the feature needs a repository. Add other lib modules (`ConfigurationModule`,
`StorageModule`, `BlockchainModule`) only when actually needed.

## Controller — microservice (`general-svc`, `process-svc`)

Use `@MessagePattern` with the typed enum from `@h2-trust/messaging`. Return `*Entity` types. Never use HTTP decorators
(`@Get`, `@Post`, etc.) in microservice controllers.

```typescript
// Apache license header required

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FeatureEntity } from '@h2-trust/contracts/entities';
import { FeatureMessagePatterns } from '@h2-trust/messaging';
import { FeatureService } from './feature.service';

@Controller()
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @MessagePattern(FeatureMessagePatterns.READ)
  findAll(): Promise<FeatureEntity[]> {
    return this.service.findAll();
  }
}
```

## Controller — BFF (REST)

Use `@Controller('resource')` with HTTP method decorators. Return `*Dto` types, never entities or payloads. Always add
Swagger decorators on every endpoint.

```typescript
// Apache license header required

import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FeatureDto } from '@h2-trust/contracts/dtos';
import { FeatureService } from './feature.service';

@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ description: 'Retrieve a feature by its ID.' })
  @ApiOkResponse({ description: 'Returns the requested feature.', type: FeatureDto })
  @ApiParam({ name: 'id', description: 'UUID of the feature.', example: 'e341b634-8f14-466a-8ae9-de41d07ce707' })
  findById(@Param('id') id: string): Promise<FeatureDto> {
    return this.featureService.findById(id);
  }
}
```

## Service

Inject the repository. Delegate persistence to the repository; keep business logic here.

```typescript
// Apache license header required

import { Injectable } from '@nestjs/common';
import { FeatureEntity } from '@h2-trust/contracts/entities';
import { FeatureRepository } from '@h2-trust/database';

@Injectable()
export class FeatureService {
  constructor(private readonly repository: FeatureRepository) {}

  findAll(): Promise<FeatureEntity[]> {
    return this.repository.findAll();
  }
}
```

For BFF services that call microservices, inject the RMQ client and use `this.client.send()` with the typed payload
class from `@h2-trust/contracts/payloads`.

## Exception Handling

Throw the narrowest exception from `@h2-trust/exceptions`:

- `DatabaseException` — persistence errors (normally raised by `wrapPrismaError`, not manually)
- `DomainException` — business rule violations
- `ValidationException` — input validation not caught by `ValidationPipe`
- `StorageException` — file/object storage errors
- `BlockchainException` — ethers / smart-contract errors
- `InternalException` — unexpected errors with no better category

## Configuration

Inject `ConfigurationService` from `@h2-trust/configuration`. Never inject `ConfigService` from `@nestjs/config`.

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '@h2-trust/configuration';

// Apache license header required

@Injectable()
export class FeatureService {
  constructor(private readonly configuration: ConfigurationService) {}

  someMethod(): void {
    const globalConfig = this.configuration.getGlobalConfiguration();
    const svcConfig = this.configuration.getProcessSvcConfiguration(); // or getBffConfiguration(), etc.
  }
}
```
