/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { CreateHydrogenTransportationPayload } from '@h2-trust/contracts/payloads';
import { BatchType, PowerType, ProcessType, RfnboType, TransportType } from '@h2-trust/domain';
import { ValidationException } from '@h2-trust/exceptions';
import { ProcessStepService } from '../process-step/process-step.service';

@Injectable()
export class TransportationService {
  constructor(private readonly processStepService: ProcessStepService) {}

  async createHydrogenTransportationProcessStep(
    payload: CreateHydrogenTransportationPayload,
  ): Promise<ProcessStepEntity> {
    this.validateTransportMode(payload.transportMode, payload);
    const transportation = this.buildTransportationEntity(payload);

    await this.processStepService.setBatchesInactive([payload.predecessorBatch.id]);
    return this.processStepService.createProcessStep(transportation);
  }

  private buildTransportationEntity(payload: CreateHydrogenTransportationPayload): ProcessStepEntity {
    return {
      ...payload.processStep,
      type: ProcessType.HYDROGEN_TRANSPORTATION,
      batch: {
        ...payload.processStep.batch,
        type: BatchType.HYDROGEN,
        predecessors: [payload.predecessorBatch],
        qualityDetails: {
          rfnboType: RfnboType.NOT_SPECIFIED,
          powerType: PowerType.NOT_SPECIFIED,
          distance: payload.distance ?? 0,
        },
      },
    };
  }

  private validateTransportMode(transportMode: TransportType, payload: CreateHydrogenTransportationPayload): void {
    const validModes = [TransportType.TRAILER, TransportType.PIPELINE];

    if (!validModes.includes(transportMode)) {
      throw new ValidationException(`Invalid transport mode: ${transportMode}`);
    }

    if (transportMode === TransportType.TRAILER) {
      if (!payload.distance) {
        throw new ValidationException(`Distance is required for transport mode [${TransportType.TRAILER}].`);
      }
      if (!payload.fuelType) {
        throw new ValidationException(`Fuel type is required for transport mode [${TransportType.TRAILER}].`);
      }
    }
  }
}
