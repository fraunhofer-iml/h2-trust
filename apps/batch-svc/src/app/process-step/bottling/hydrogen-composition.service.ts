/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { parseColor } from '@h2-trust/api';
import { HydrogenColorDbEnum } from '@h2-trust/database';

@Injectable()
export class HydrogenCompositionService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async determineHydrogenComposition(processStep: ProcessStepEntity): Promise<HydrogenComponentEntity[]> {
    const color = parseColor(processStep.batch.quality);

    if (color === HydrogenColorDbEnum.GREEN) {
      return [new HydrogenComponentEntity(HydrogenColorDbEnum.GREEN, processStep.batch.amount)];
    }

    const hydrogenStorageUnit: HydrogenStorageUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: processStep.executedBy.id }),
    );
    try {
      return HydrogenCompositionUtil.computeHydrogenComposition(hydrogenStorageUnit.filling, processStep.batch.amount);
    } catch (BrokerException) {
      throw new BrokerException(
        `Total stored amount of ${hydrogenStorageUnit.id} is not greater than 0`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
