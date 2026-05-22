---
applyTo: 'apps/frontend/src/**'
---

# Angular Component Conventions

## Standalone Components

All components are standalone (Angular 21 default). Use `selector: 'app-{name}'`. Use `inject()` for dependencies, not
constructor injection.

```typescript
import { Component, inject } from '@angular/core';
import { SomeService } from '../../shared/services/some/some.service';

@Component({
  selector: 'app-feature',
  imports: [
    /* Angular + Material modules used in template */
  ],
  templateUrl: './feature.component.html',
})
export class FeatureComponent {
  private readonly someService = inject(SomeService);
}
```

## Data Fetching — TanStack Query

Use `injectQuery` and `injectMutation` from `@tanstack/angular-query-experimental`. Define query options as factory
functions in `src/app/shared/queries/{domain}.query.ts` and reuse them across components.

```typescript
import { injectQuery } from '@tanstack/angular-query-experimental';
import { featureQueryOptions } from '../../shared/queries/feature.query';

featureQuery = injectQuery(() => featureQueryOptions(this.someService));
```

Access results via signals: `this.featureQuery.data()`, `this.featureQuery.isLoading()`.

## Reactive State

Use `signal()` and `computed()` for local state. For subscriptions, use `takeUntilDestroyed`:

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

private destroyRef = inject(DestroyRef);

someObservable$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);
```

## Imports

- Only import from `@h2-trust/contracts/dtos` — ESLint blocks entities and payloads in the frontend.
- Only import from `@h2-trust/domain` for enums and domain constants.
- Use `@h2-trust/strings` for enum label mapping in templates.

## Styling

Use Tailwind CSS 4 utility classes for layout and spacing. Use Angular Material components (`MatButtonModule`,
`MatTableModule`, `MatDialogModule`, etc.) for interactive UI elements. Import only the specific Material modules needed
by the template.

## Routing

Route paths are defined in `src/app/shared/constants/routes.ts` as the `H2TrustRoutes` enum. Use `[routerLink]` with
enum values; never hardcode route strings in components.

## Services

HTTP calls to the BFF live in `src/app/shared/services/{domain}/{domain}.service.ts`. Services use `HttpClient`
internally; components never call `HttpClient` directly.
