/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity, ProofOfSustainabilityEmissionCalculationEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/api';
import {
  CalculationTopic,
  EmissionNumericConstants,
  EmissionStringConstants,
  EnergySource,
  HydrogenColor,
  MeasurementUnit,
  PowerType,
  ProcessType,
} from '@h2-trust/domain';

@Injectable()
export class HydrogenProductionEmissionService {
  public static computeProvenanceEmissionsForHydrogenProduction(
    provenance: ProvenanceEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (!provenance || !provenance.hydrogenProductions) {
      throw new Error('Provenance or hydrogen productions is undefined.');
    }

    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    const hydrogenStorages: ProofOfSustainabilityEmissionCalculationEntity[] = provenance.hydrogenProductions.map(
      (hydrogenProduction) => this.assembleHydrogenStorage(hydrogenProduction),
    );

    const totalEmissions = hydrogenStorages.reduce((sum, curr) => sum + curr.result, 0);

    const totalEmissionsGrouped = Array.from(
      provenance.hydrogenProductions
        .reduce((map, entity, index) => {
          const color = EnumLabelMapper.getHydrogenColor(entity.batch.qualityDetails?.color as HydrogenColor);
          return map.set(color, (map.get(color) ?? 0) + hydrogenStorages[index].result);
        }, new Map<string, number>())
        .entries(),
    ).map(([color, result]) => `${color}: ${result} ${MeasurementUnit.G_CO2}`);

    const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_STORAGE,
    );
  }

  static assembleHydrogenStorage(
    hydrogenProduction: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (hydrogenProduction?.type !== ProcessType.HYDROGEN_PRODUCTION) {
      throw new Error(
        `Invalid process step type [${hydrogenProduction?.type}] for hydrogen storage emission calculation`,
      );
    }
    const powerType: PowerType = hydrogenProduction.batch.qualityDetails.powerType as PowerType;
    const emissionFactor = EmissionNumericConstants.POWER_TYPE_EMISSION_FACTORS[powerType];

    const result =
      EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2 *
      emissionFactor *
      hydrogenProduction.batch.amount;

    const hydrogenProducedKgInput = `Hydrogen Produced: ${hydrogenProduction.batch.amount} ${MeasurementUnit.KG_H2}`;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(EnergySource.GRID);
    const energyDemandInput = `Energy Demand: ${EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2} ${MeasurementUnit.KWH_PER_KG_H2}`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH}`;
    const formula = `E = Energy Demand * Emission Factor ${emissionFactorLabel} * Hydrogen Produced`;
    const formulaResult = `${result} ${MeasurementUnit.G_CO2} = ${EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2} ${MeasurementUnit.KWH_PER_KG_H2} * ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH} * ${hydrogenProduction.batch.amount} ${MeasurementUnit.KG_H2}`;

    const basisOfCalculation = [
      energyDemandInput,
      emissionFactorInput,
      hydrogenProducedKgInput,
      formula,
      formulaResult,
    ];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.COMPRESSION,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_STORAGE,
    );
  }
}
