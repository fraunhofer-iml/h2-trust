/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 * Loader for PowerProductionUnitEntity with simple in-memory caching.
 */
import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, PowerProductionUnitEntity, ProcessStepEntity, UnitMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';

@Injectable()
export class PowerUnitLoader {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) { }

  async fetchPowerProductionUnits(powerProductions: ProcessStepEntity[] = []): Promise<Map<string, PowerProductionUnitEntity>> {
    if (!powerProductions.length) {
      return new Map();
    }

    if (!powerProductions.every((powerProduction) => powerProduction.type === ProcessType.POWER_PRODUCTION)) {
      throw new Error(`All ProcessSteps must be of type [${ProcessType.POWER_PRODUCTION}].`);
    }

    const unitIds = Array.from(new Set(powerProductions.map((powerProduction) => powerProduction.executedBy.id)));

    const units: PowerProductionUnitEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_MANY, { ids: unitIds }),
    );

    const unitsById = new Map<string, PowerProductionUnitEntity>(units.map((u) => [u.id, u]));

    for (const unitId of unitIds) {
      if (!unitsById.has(unitId)) {
        throw new Error(`PowerProductionUnit [${unitId}] not found.`);
      }
    }

    return new Map(
      powerProductions.map((powerProduction) => {
        const unit = unitsById.get(powerProduction.executedBy.id)!;
        return [powerProduction.id, unit];
      }),
    );
  }
}
