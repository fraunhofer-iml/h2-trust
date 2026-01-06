/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProvenanceEntity,
  ReadByIdsPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionComputationResultDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { EmissionCalculationAssembler } from './emission.assembler';

@Injectable()
export class EmissionComputationService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy) {}

  async computeProvenanceEmissions(provenance: ProvenanceEntity): Promise<EmissionComputationResultDto> {
    if (!provenance) {
      throw new Error('Provenance is undefined.');
    }

    if (!provenance.hydrogenBottling) {
      throw new Error('Provenance is missing hydrogen bottling process step.');
    }

    const emissionCalculations: EmissionCalculationDto[] = [];

    if (provenance.powerProductions) {
      const powerProductions: EmissionCalculationDto[] = await this.computePowerSupplyEmissions(
        provenance.powerProductions,
        provenance.hydrogenBottling.batch.amount,
      );
      emissionCalculations.push(...powerProductions);
    }

    if (provenance.waterConsumptions) {
      const waterConsumptions: EmissionCalculationDto[] = provenance.waterConsumptions.map((waterConsumption) =>
        EmissionCalculationAssembler.assembleWaterSupplyCalculation(
          waterConsumption,
          provenance.hydrogenBottling.batch.amount,
        ),
      );
      emissionCalculations.push(...waterConsumptions);
    }

    if (provenance.hydrogenProductions) {
      const hydrogenStorages: EmissionCalculationDto[] = provenance.hydrogenProductions.map((hydrogenProduction) =>
        EmissionCalculationAssembler.assembleHydrogenStorageCalculation(hydrogenProduction),
      );
      emissionCalculations.push(...hydrogenStorages);
    }

    if (provenance.hydrogenBottling) {
      const hydrogenBottling: EmissionCalculationDto = EmissionCalculationAssembler.assembleHydrogenBottlingCalculation(
        provenance.hydrogenBottling,
      );
      emissionCalculations.push(hydrogenBottling);
    }

    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenTransportation: EmissionCalculationDto =
        EmissionCalculationAssembler.assembleHydrogenTransportationCalculation(provenance.root);
      emissionCalculations.push(hydrogenTransportation);
    }

    return EmissionCalculationAssembler.assembleComputationResult(emissionCalculations);
  }

  async computePowerSupplyEmissions(
    powerProductions: ProcessStepEntity[],
    hydrogenAmount: number,
  ): Promise<EmissionCalculationDto[]> {
    if (!powerProductions.length) {
      return [];
    }

    const unitIds = Array.from(new Set(powerProductions.map((p) => p.executedBy.id)));

    const units: PowerProductionUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS, ReadByIdsPayload.of(unitIds)),
    );

    const unitsById = new Map<string, PowerProductionUnitEntity>(units.map((u) => [u.id, u]));
    for (const unitId of unitIds) {
      if (!unitsById.has(unitId)) {
        throw new Error(`PowerProductionUnit [${unitId}] not found.`);
      }
    }

    return powerProductions.map((powerProduction) => {
      const unit = unitsById.get(powerProduction.executedBy.id)!;
      return EmissionCalculationAssembler.assemblePowerSupplyCalculation(
        powerProduction,
        unit.type.energySource,
        hydrogenAmount,
      );
    });
  }
}
