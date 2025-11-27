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
  ProvenanceMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionComputationResultDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { EmissionCalculationAssembler } from './emission.assembler';

@Injectable()
export class EmissionComputationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
  ) { }

  async computeProvenanceEmissions(provenance: ProvenanceEntity): Promise<EmissionComputationResultDto> {
    const emissionCalculations: EmissionCalculationDto[] = [];

    if (provenance.powerProductions) {
      const powerProductions: EmissionCalculationDto[] = await this.computePowerSupplyEmissions(
        provenance.powerProductions,
      );
      emissionCalculations.push(...powerProductions);
    }

    if (provenance.waterConsumptions) {
      const waterConsumptions: EmissionCalculationDto[] = provenance.waterConsumptions.map((waterSupply) =>
        this.computeWaterSupplyEmissions(waterSupply),
      );
      emissionCalculations.push(...waterConsumptions);
    }

    if (provenance.hydrogenProductions) {
      const hydrogenProductions: EmissionCalculationDto[] = provenance.hydrogenProductions.map((hydrogenProduction) =>
        EmissionCalculationAssembler.assembleHydrogenStorageCalculation(hydrogenProduction),
      );
      emissionCalculations.push(...hydrogenProductions);
    }

    if (provenance.hydrogenBottling) {
      const hydrogenBottling: EmissionCalculationDto =
        EmissionCalculationAssembler.assembleHydrogenBottlingCalculation();
      emissionCalculations.push(hydrogenBottling);
    }

    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenTransportation: EmissionCalculationDto =
        EmissionCalculationAssembler.assembleHydrogenTransportationCalculation(provenance.root);
      emissionCalculations.push(hydrogenTransportation);
    }

    return EmissionCalculationAssembler.assembleComputationResult(emissionCalculations);
  }

  async computePowerSupplyEmissions(powerSupplies: ProcessStepEntity[]): Promise<EmissionCalculationDto[]> {
    if (!powerSupplies.length) {
      return [];
    }

    const unitIds = Array.from(new Set(powerSupplies.map((p) => p.executedBy.id)));

    const units: PowerProductionUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS, { ids: unitIds }),
    );

    const unitsById = new Map<string, PowerProductionUnitEntity>(units.map((u) => [u.id, u]));
    for (const unitId of unitIds) {
      if (!unitsById.has(unitId)) {
        throw new Error(`PowerProductionUnit [${unitId}] not found.`);
      }
    }

    return powerSupplies.map((powerSupply) => {
      const unit = unitsById.get(powerSupply.executedBy.id)!;
      return EmissionCalculationAssembler.assemblePowerSupplyCalculation(powerSupply, unit.type.energySource);
    });
  }

  computeWaterSupplyEmissions(waterSupply: ProcessStepEntity): EmissionCalculationDto {
    return EmissionCalculationAssembler.assembleWaterSupplyCalculation(waterSupply);
  }

  async computeCumulativeEmissions(
    processStepId: string,
    emissionCalculationName: string,
  ): Promise<EmissionCalculationDto> {
    const provenance: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, { processStepId }),
    );
    const provenanceEmission: EmissionComputationResultDto = await this.computeProvenanceEmissions(provenance);

    return EmissionCalculationAssembler.assembleCumulativeCalculation(
      provenanceEmission.calculations,
      emissionCalculationName,
    );
  }
}
