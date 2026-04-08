/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/api';
import {
  CalculationTopic,
  EmissionNumericConstants,
  EnergySource,
  MeasurementUnit,
  PowerType,
  ProcessType,
} from '@h2-trust/domain';
import { ProofOfSustainabilityAssembler } from './proof-of-sustainability-assembler.interface';

export class PowerProductionPosService implements ProofOfSustainabilityAssembler {
  public assembleEmissions(provenance: ProvenanceEntity): ProofOfSustainabilityEmissionCalculationEntity[] {
    if (!provenance.getAllPowerProductions()) {
      return [];
    }

    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    const powerProductionsPos: ProofOfSustainabilityEmissionCalculationEntity[] = provenance
      .getAllPowerProductions()
      .map((powerProduction) => {
        if (!powerProduction.executedBy) {
          throw new Error(`PowerProductionUnit for process step ${powerProduction} not found.`);
        }
        const unit = powerProduction.executedBy as PowerProductionUnitEntity;
        return this.assemblePowerSupply(powerProduction, unit.type.energySource);
      });

    const totalEmissions = powerProductionsPos.reduce((sum, curr) => sum + curr.result, 0);

    const totalEmissionsGrouped = Array.from(
      powerProductionsPos
        .reduce(
          (map, entity) => map.set(entity.name, (map.get(entity.name) ?? 0) + entity.result),
          new Map<string, number>(),
        )
        .entries(),
    ).map(([energySource, result]) => `${energySource}: ${result} ${MeasurementUnit.G_CO2}`);

    const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

    return [
      new ProofOfSustainabilityEmissionCalculationEntity(
        totalEmissions.toString(),
        totalEmissionsGrouped,
        totalEmissionsPerKgHydrogen,
        MeasurementUnit.G_CO2_PER_KG_H2,
        CalculationTopic.POWER_SUPPLY,
      ),
    ];
  }

  public assemblePowerSupply(
    powerProduction: ProcessStepEntity,
    energySource: EnergySource,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (powerProduction?.type !== ProcessType.POWER_PRODUCTION) {
      throw new Error(`Invalid process step type [${powerProduction?.type}] for power supply emission calculation`);
    }

    const power = powerProduction.batch.amount;
    const powerInput = `Power Input: ${power} ${MeasurementUnit.KWH}`;
    const powerType: PowerType = powerProduction.batch.qualityDetails.powerType as PowerType;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(energySource);
    const emissionFactor = EmissionNumericConstants.POWER_TYPE_EMISSION_FACTORS[powerType];
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH}`;

    const result = power * emissionFactor;
    const formula = `E = Power Input * Emission Factor ${emissionFactorLabel}`;
    const formulaResult = `${result} ${MeasurementUnit.G_CO2} = ${power} ${MeasurementUnit.KWH} * ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH}`;

    const basisOfCalculation = [powerInput, emissionFactorInput, formula, formulaResult];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      emissionFactorLabel,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.POWER_SUPPLY,
    );
  }

  public computePowerSupplyEmissions(
    powerProductions: ProcessStepEntity[],
  ): ProofOfSustainabilityEmissionCalculationEntity[] {
    if (!powerProductions.length) {
      return [];
    }

    return powerProductions.map((powerProduction) => {
      if (!powerProduction.executedBy) {
        throw new Error(`PowerProductionUnit for process step ${powerProduction} not found.`);
      }
      const unit = powerProduction.executedBy as PowerProductionUnitEntity;
      return this.assemblePowerSupply(powerProduction, unit.type.energySource);
    });
  }
}
