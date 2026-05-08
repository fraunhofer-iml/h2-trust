# Precondition Hardening Plan

Ein PR, mehrere Commits. Ziel: Production-Reife der Precondition-Checks in `apps/bff`, `apps/process-svc`, `apps/general-svc` sowie Migration der Assertion-Helper auf die neue Exception-Architektur.

## Grundsätze
- Keine Kompatibilitätsbrücken. Wenn etwas bricht, sauber reparieren.
- Clean Code statt Workarounds.
- Tests in diesem PR ignoriert (separates Ticket).
- `hasFinancialSupport`-Logik **außen vor** (separater PR).
- `updateOrCreate*`-Split der Unit-Controller **außen vor** (separater PR).
- `saveRemainingPowerProduction` mit neuer ID ist **bewusste Architektur**, kein Fix.
- CSV-Import User-Feedback **außen vor** (kommt mit größerem CSV-Refactor).
- Entity-Factory-Konsolidierung der `assertValidEnum`-Calls **gestrichen** (DRY-only, kein Robustheits-Gewinn).
- **`@h2-trust/exceptions` gehören NICHT in den BFF** — Architekturgrenzen. Der BFF ist HTTP-Schicht; er wirft NestJS-HTTP-Exceptions (`BadRequestException`, `NotFoundException`, …). `@h2-trust/exceptions` sind für die RPC-Schicht (process-svc, general-svc) reserviert. RPC-Fehler von Microservices werden vom `all-exceptions.filter.ts` in Problem-Details übersetzt.

## Verifizierte Architektur-Realität (vor Plan-Erstellung geprüft)
- `@h2-trust/exceptions` liefert `ValidationException`, `DatabaseException`, `DomainException`, `InternalException`, `BlockchainException`, `StorageException`. Implementiert mit Commit 51125413.
- **Microservice-`ValidationPipe` ist in `process-svc` und `general-svc` bereits aktiv** mit `transform: true, whitelist: true, forbidNonWhitelisted: true`. Kein Setup-Bedarf.
- **BFF-`ValidationPipe`** läuft mit `whitelist: false, forbidNonWhitelisted: false` (TODO DUHGW-220).
- **`BadRequestException`-Mapping** aus der BFF-`ValidationPipe` zu `urn:h2-trust:problem:validation-error` ist in `apps/bff/src/all-exceptions.filter.ts` bereits umgesetzt.
- **Payloads transportieren teilweise Domain-Entities** (`ProcessStepEntity`, `BatchEntity`, `UnitFileImport`) statt schlanker Transport-DTOs — strikte Validierung dieser Payloads ist ein Transport-vs-Domain-Refactor und gehört nicht in diesen PR.
- **Internal RPC-Reads haben keinen Auth-Kontext** (z. B. `bff/unit.service.ts` sendet `READ_BY_ID` ohne `requesterCompanyId`). Globale Ownership-Filter auf Reads würden interne Orchestrierung brechen.
- Nur String-Enums in der Codebase; Numeric-Enums werden nicht zugelassen.
- Repository-Aufrufe verwenden ein `entityLabel` als Klassenkonstante, nicht als Argument pro Aufruf.
- `ParseDatePipe` existiert in NestJS nicht.

---

## Commits

### Commit 1 — `refactor(utils): migrate assertions to ValidationException`
- `libs/utils/src/lib/assertions.ts`:
  - `assertDefined`, `assertBoolean`, `assertValidEnum`, `assertValidTimeZone` werfen `ValidationException` statt `Error`.
  - `assertValidEnum<E extends Record<string, string>>` — String-Enum-Constraint.
  - `assertValidTimeZone(value: unknown, name = 'timezone')` — härter, leerer String abgefangen.
- `libs/utils/src/lib/date-time.ts`: ad-hoc `throw new Error(...)` → `ValidationException`.

### Commit 2 — `refactor(database): improve repository-assertions`
- `assertAllIdsFound` mit `Set<string>` (O(n+m) statt O(n·m)).
- Variable `(u)` → `(r)`.
- Neues Pattern in jedem Repository:
  ```ts
  private readonly entityLabel = 'Unit';
  private assertFound<T>(rec: T | null, id: string): asserts rec is T {
    assertRecordFound(rec, id, this.entityLabel);
  }
  ```
- Default-Plural via `${label}s` in `assertAllIdsFound`. Subsets als zusätzliche Konstanten am Repository.
- Konsistenz: PascalCase singular (`'ProcessStep'` statt `'process-step'`, `'Unit'`, `'User'`).
- Aufrufer entlastet: `this.assertFound(unit, id)` statt `assertRecordFound(unit, id, 'Unit')`.

### Commit 3 — `refactor(process-svc): tighten error handling and casts`
- `red-compliance.ts`: `assertValidBiddingZone` durch `assertValidEnum(zone, BiddingZone, 'BiddingZone')` ersetzen.
- `production.service.ts:111,144`: `throw new Error(...)` → `InternalException`.
- Unsichere Casts → `assertDefined` / `assertValidEnum`:
  - `production.assembler.ts:33-35,45,56-58,85-87,97` (`Map.get`-Casts + `as PowerType`)
  - `provenance.service.ts:40-58`
  - `production-creation.service.ts:97-98`
  - `digital-product-passport.service.ts` (`as PowerType` etc.)
  - `proof-of-origin.assembler.ts:56-59`
  - `bottling.allocator.ts:119-126`
  - `hydrogen-transportation-emission-calculation.assembler.ts:48-52`
- `proof-of-sustainability.assembler.ts:34-36,56-57`: Division-by-Zero Guard für `hydrogenAmount === 0`.
- `csv-import-processing.service.ts`: `parsedImports.length > 0` Invariante in `createCsvDocumentInputs`.

### Commit 4 — `feat(general-svc,bff): existence checks and PPA authorization fix`
**Bewusst eng gefasst — Ownership nur für Mutationen, nicht für Reads.** Reads bleiben offen, da interne RPC-Orchestrierung sie ohne Auth-Kontext nutzt.
- Existenz-Checks (Reads):
  - `general-svc/user/user.service.ts`: `readUserWithCompany` → `assertRecordFound`.
  - `general-svc/unit/unit.service.ts`: `readUnitById` → `assertRecordFound`.
  - `general-svc/unit/unit.service.ts`: `readUnitsByIds` + `readPowerProductionUnitsByIds` + `readHydrogenProductionUnitsByIds` → `assertAllIdsFound`.
- PPA-Authorization-Bypass-Fix:
  - `power-purchase-agreement.service.ts:49,51`: zwei fehlende `await` ergänzen (`checkUserAccessToPowerPurchaseAgreement` + `hasUserOwnershipOverPowerProductionUnit`).
- PPA Date-Ordering: `validFrom < validTo` als Invariante mit `ValidationException`.
- Ownership auf Mutationen (Unit-Updates + Status-Updates):
  - `requesterCompanyId` zu den Update-Payloads ergänzen (`CreateHydrogenProductionUnitPayload`, `CreatePowerProductionUnitPayload`, `CreateHydrogenStorageUnitPayload`, `UpdateUnitStatusPayload`) **nur dort**, wo Updates fließen.
  - In `general-svc` vor dem `update`: `assertRecordFound` + `unit.ownerId === payload.requesterCompanyId` prüfen, sonst `DomainException(DOMAIN_BUSINESS_RULE_VIOLATION)`.
  - BFF setzt `requesterCompanyId` aus dem authentifizierten User-Kontext (`UserService.getCompanyIdFromUserId`).
- Read-Ownership-Filter explizit **nicht** Teil dieses Commits — eigener PR, falls nötig (entweder durch Trennung interner/externer MessagePatterns oder Auth-Kontext überall).

### Commit 5 — `feat(bff): improve file download pipeline and tighten mapUnitsToFiles`
- `bff/file-download/file-download.service.ts`:
  - Stream-Robustheit über `pipeline()` aus `node:stream/promises` statt manuellem `pipe()` + try/catch. Fehlerpfade liefern saubere Header, wenn noch nicht gestreamt.
  - `NotFoundException` bleibt `NotFoundException` (NestJS HTTP-Exception, korrekt im BFF).
- `bff/production/production.service.ts:145-156`: `mapUnitsToFiles` — bestehende `<`-Prüfung auf strikte Gleichheit (`unitIds.length === files.length`) verschärfen mit `BadRequestException`; überzählige unitIds sind ein Aufruf-Fehler.

### Commit 6 — `refactor(bff): tighten query parsing and bottling date validation`
- `bff/bottling/bottling.service.ts:43`: Date-Validierung über bestehenden `toValidDate`-Helper aus `@h2-trust/utils` vor `new Date(dto.filledAt)` — bei ungültigem Datum `BadRequestException`.
- Query-Param-Validierung in `bff/production/production.controller.ts`:
  - **Designentscheid (in diesem Commit umgesetzt)**: Query-DTOs mit `class-validator` + `@Type` (analog zu bestehenden Body-DTOs). Eigener `ParseDatePipe` wird nicht eingeführt, da das Projekt bereits auf class-validator/class-transformer setzt.
  - Query-DTO mit `@IsInt`/`@Min` für `pageNumber`, `pageSize` und `@IsDate` + `@Type(() => Date)` für `month`, `from`, `to`.
- **Nicht mehr in diesem Commit**: `BadRequestException` → `ValidationException` in BFF-Services (Architekturgrenzen — BFF wirft ausschließlich NestJS-HTTP-Exceptions).

### Commit 7 — `fix(process-svc): transactional production finalization`
- `production-staging.service.ts:97-145`:
  - RPC-Calls (Unit-Lookup gegen general-svc, Blockchain-Reads) **vor** der Transaction.
  - `prismaService.$transaction` umfasst nur DB-Writes: `createAndPersistProductions`, `setStagedProductionsToInactive`, `saveRemainingPowerProduction`.
  - Ownership-Filter auf `findStagedProductionsForIds(ids, requesterCompanyId)` — Payload bekommt `requesterCompanyId`, ist hier sinnvoll, da der Aufruf aus dem BFF kommt und Auth-Kontext vorhanden ist.
  - `productionUnitForId.get(...) as ...` → `assertDefined` mit `InternalException`.

### Commit 8 — `chore(contracts): audit existing payload validation decorators`
**Stark verkleinert gegenüber dem ursprünglichen Plan**, weil die globalen `ValidationPipe`-Konfigurationen schon aktiv sind. Echte Restarbeit:
- `libs/contracts/src/lib/payloads/`-Sweep: identifiziere Payloads ohne `class-validator`-Decorators und ergänze `@IsString`/`@IsUUID`/`@IsEnum`/`@IsArray` etc. — **nur einfache Transport-Payloads**, keine, die Domain-Entities transportieren.
- Payloads, die Domain-Entities transportieren (`CreateHydrogenTransportationPayload`, `CreateManyProcessStepsPayload`, `StageProductionsPayload`, ggf. weitere) werden im PR **nicht** strikter validiert. Diese Trennung Transport/Domain ist ein eigenes Refactor-Ticket.
- Falls beim Audit Payloads gefunden werden, die zwar Decorators haben aber unter der bereits aktiven `forbidNonWhitelisted`-Pipe sofort versagen würden (Mismatches Decorator vs. tatsächlich gesendetes Feld), saubere Reparatur.

### Commit 9 — `chore: remove dead defensive code`
- `production.utils.ts:63`: redundanter `Math.max(1, ...)` neben hartem Throw.
- `production-staging.service.ts:358`: dead `if (splittedPowerProduction)`.
- `power-production-emission-calculation.assembler.ts:81`, `water-consumption-emission-calculation.assembler.ts:55`, `hydrogen-production-emission-calculation.assembler.ts:21`: `if (!arr)` über typisierten Arrays.
- `digital-product-passport/util.ts:51,67`: `(batches || [])` / `(subClassifications || [])`.

### Commit 10 — `feat(bff): enable strict DTO whitelist`
- `apps/bff/src/main.ts`: `whitelist: true`, `forbidNonWhitelisted: true`.
- TODO `DUHGW-220` entfernen.
- Alle daraus entstehenden Brüche an DTO-/Endpunkt-Ebene beseitigen.

---

## Verschoben in eigene PRs (bewusste Begrenzung)
- **Read-Ownership-Filter** auf alle MessagePatterns — erfordert Trennung interner/externer Patterns oder durchgängigen Auth-Kontext.
- **Domain-Entity-Payloads** auf Transport-DTOs umstellen.
- **`hasFinancialSupport`-Logik** (Audit #30).
- **`updateOrCreate*`-Split** der Unit-Controller (Audit #55).
- **AMQP-Idempotenz** (Audit #66).
- **CSV-Import User-Feedback** (Audit #19).
- **Pagination** auf `company.findAll`.
- **Tests** für alle obigen Änderungen (separates Ticket).

## Risiken
- Commit 7 (Transactional Finalization): semantischer Eingriff. Reihenfolge der externen Reads vs. DB-Writes muss korrekt sein.
- Commit 10 (`whitelist: true`): kann unbekannte Endpunkt-Brüche provozieren. Daher als letzter Commit.
- Commit 4 (Ownership auf Mutationen): ändert Verhalten — Frontend-Impact prüfen (Fehler-Responses bei fremder Unit-ID).

## Aus dem Plan entfernt (irrtümlich aufgeführt — bereits umgesetzt)
- Globale RPC-`ValidationPipe` in `process-svc`/`general-svc` einführen — **läuft bereits**.
- Globaler Exception-Filter mappt `BadRequestException` der BFF-`ValidationPipe` — **läuft bereits**.
