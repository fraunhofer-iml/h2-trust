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

@Injectable()
export class PowerUnitLoader {
  private readonly byUnitId = new Map<string, PowerProductionUnitEntity>();

  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async loadByProcessSteps(steps: ProcessStepEntity[] = []): Promise<Map<string, PowerProductionUnitEntity>> {
    const pairs = await Promise.all(
      steps.map(async (s) => {
        const unitId = s.executedBy.id;
        let unit = this.byUnitId.get(unitId);
        if (!unit) {
          unit = await firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, { id: unitId }));
          this.byUnitId.set(unitId, unit);
        }
        return [s.id, unit] as const;
      }),
    );
    return new Map(pairs);
  }
}
