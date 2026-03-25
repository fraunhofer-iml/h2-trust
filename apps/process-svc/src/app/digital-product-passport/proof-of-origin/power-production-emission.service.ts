/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  PowerProductionUnitEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { CalculationTopic, MeasurementUnit } from '@h2-trust/domain';
import { EmissionAssembler } from './emission.assembler';

@Injectable()
export class PowerProductionEmissionService {
  public static computeProvenanceEmissionsForPowerProduction(
    provenance: ProvenanceEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (!provenance || !provenance.powerProductions) {
      throw new Error('Provenance or powerProduction is undefined.');
    }

    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    const powerProductions: ProofOfSustainabilityEmissionCalculationEntity[] = provenance.powerProductions.map(
      (powerProduction) => {
        if (!powerProduction.executedBy) {
          throw new Error(`PowerProductionUnit for process step ${powerProduction} not found.`);
        }
        const unit = powerProduction.executedBy as PowerProductionUnitEntity;
        return EmissionAssembler.assemblePowerSupply(powerProduction, unit.type.energySource);
      },
    );

    const totalEmissions = powerProductions.reduce((sum, curr) => sum + curr.result, 0);

    const totalEmissionsGrouped = Array.from(
      powerProductions
        .reduce(
          (map, entity) => map.set(entity.name, (map.get(entity.name) ?? 0) + entity.result),
          new Map<string, number>(),
        )
        .entries(),
    ).map(([energySource, result]) => `${energySource}: ${result} ${MeasurementUnit.G_CO2}`);

    const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.POWER_SUPPLY,
    );
  }
}
