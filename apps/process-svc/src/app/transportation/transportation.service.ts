/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateHydrogenTransportationPayload, ProcessStepEntity, TransportationDetailsEntity } from '@h2-trust/amqp';
import { BatchType, FuelType, ProcessType, TransportMode } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';

@Injectable()
export class TransportationService {
  constructor(private readonly processStepService: ProcessStepService) {}

  async createHydrogenTransportationProcessStep(
    payload: CreateHydrogenTransportationPayload,
  ): Promise<ProcessStepEntity> {
    const transportationDetails: TransportationDetailsEntity = this.buildTransportationDetails(
      payload.transportMode,
      payload.distance,
      payload.fuelType,
    );

    const transportation: ProcessStepEntity = {
      ...payload.processStep,
      type: ProcessType.HYDROGEN_TRANSPORTATION,
      batch: {
        ...payload.processStep.batch,
        type: BatchType.HYDROGEN,
        predecessors: [payload.predecessorBatch],
      },
      transportationDetails,
    };

    await this.processStepService.setBatchesInactive([payload.predecessorBatch.id]);
    return this.processStepService.createProcessStep(transportation);
  }

  private buildTransportationDetails(
    transportMode: TransportMode,
    distance: number,
    fuelType: FuelType,
  ): TransportationDetailsEntity {
    let output: TransportationDetailsEntity;

    switch (transportMode) {
      case TransportMode.TRAILER:
        if (!distance) {
          throw new HttpException(
            `Distance is required for transport mode [${TransportMode.TRAILER}].`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!fuelType) {
          throw new HttpException(
            `Fuel type is required for transport mode [${TransportMode.TRAILER}].`,
            HttpStatus.BAD_REQUEST,
          );
        }

        output = new TransportationDetailsEntity(undefined, distance, transportMode, fuelType);
        break;
      case TransportMode.PIPELINE:
        output = new TransportationDetailsEntity(undefined, 0, transportMode, undefined);
        break;
      default: {
        throw new HttpException(`Invalid transport mode: ${transportMode}`, HttpStatus.BAD_REQUEST);
      }
    }

    return output;
  }
}
