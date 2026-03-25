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
  ProcessStepEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/api';
import { CalculationTopic, HydrogenColor, MeasurementUnit, ProcessType } from '@h2-trust/domain';
import { EmissionAssembler } from './emission.assembler';
import { PowerProductionEmissionService } from './power-production-emission.service';

//TODO-LG: refactor the computeProvenenceEmission functions
@Injectable()
export class EmissionService {
  computeProvenanceEmissions(provenance: ProvenanceEntity): ProofOfSustainabilityEntity {
    if (!provenance) {
      throw new Error('Provenance is undefined.');
    }

    const emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[] = [];
    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    emissionCalculations.push(PowerProductionEmissionService.computeProvenanceEmissionsForPowerProduction(provenance));

    if (provenance.waterConsumptions) {
      const waterConsumptions: ProofOfSustainabilityEmissionCalculationEntity[] = provenance.waterConsumptions.map(
        (waterConsumption) => EmissionAssembler.assembleWaterSupply(waterConsumption),
      );

      const totalEmissions = waterConsumptions.reduce((acc, wc) => acc + wc.result, 0);
      const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
      const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsPerKgHydrogen,
          MeasurementUnit.G_CO2_PER_KG_H2,
          CalculationTopic.WATER_SUPPLY,
        ),
      );
    }

    if (provenance.hydrogenProductions) {
      const hydrogenStorages: ProofOfSustainabilityEmissionCalculationEntity[] = provenance.hydrogenProductions.map(
        (hydrogenProduction) => EmissionAssembler.assembleHydrogenStorage(hydrogenProduction),
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

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsPerKgHydrogen,
          MeasurementUnit.G_CO2_PER_KG_H2,
          CalculationTopic.HYDROGEN_STORAGE,
        ),
      );
    }

    if (provenance.hydrogenBottling) {
      const hydrogenBottling: ProofOfSustainabilityEmissionCalculationEntity =
        EmissionAssembler.assembleHydrogenBottling(provenance.hydrogenBottling);

      const totalEmissions = hydrogenBottling.result;
      const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
      const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsPerKgHydrogen,
          MeasurementUnit.G_CO2_PER_KG_H2,
          CalculationTopic.HYDROGEN_BOTTLING,
        ),
      );
    }

    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenTransportation: ProofOfSustainabilityEmissionCalculationEntity =
        EmissionAssembler.assembleHydrogenTransportation(provenance.root);

      const totalEmissions = hydrogenTransportation.result;
      const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
      const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsPerKgHydrogen,
          MeasurementUnit.G_CO2_PER_KG_H2,
          CalculationTopic.HYDROGEN_TRANSPORTATION,
        ),
      );
    }

    return EmissionAssembler.assembleProofOfSustainability(provenance.root.id, emissionCalculations, hydrogenAmount);
  }

  computePowerSupplyEmissions(powerProductions: ProcessStepEntity[]): ProofOfSustainabilityEmissionCalculationEntity[] {
    if (!powerProductions.length) {
      return [];
    }

    return powerProductions.map((powerProduction) => {
      if (!powerProduction.executedBy) {
        throw new Error(`PowerProductionUnit for process step ${powerProduction} not found.`);
      }
      const unit = powerProduction.executedBy as PowerProductionUnitEntity;
      return EmissionAssembler.assemblePowerSupply(powerProduction, unit.type.energySource);
    });
  }
}
