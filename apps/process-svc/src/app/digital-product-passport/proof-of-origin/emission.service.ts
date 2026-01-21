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
  ProofOfSustainabilityEmissionCalculationEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  ReadByIdsPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/api';
import { CalculationTopic, HydrogenColor, ProcessType, UNIT_G_CO2, UNIT_G_CO2_PER_KG_H2 } from '@h2-trust/domain';
import { EmissionAssembler } from './emission.assembler';

@Injectable()
export class EmissionService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy) {}

  async computeProvenanceEmissions(provenance: ProvenanceEntity): Promise<ProofOfSustainabilityEntity> {
    if (!provenance) {
      throw new Error('Provenance is undefined.');
    }

    if (!provenance.hydrogenBottling) {
      throw new Error('Provenance is missing hydrogen bottling process step.');
    }

    const emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[] = [];
    const bottledHydrogenAmount = provenance.hydrogenBottling.batch.amount;

    if (provenance.powerProductions) {
      const powerProductions: ProofOfSustainabilityEmissionCalculationEntity[] = await this.computePowerSupplyEmissions(
        provenance.powerProductions,
      );

      const totalEmissions = powerProductions.reduce((sum, curr) => sum + curr.result, 0);

      const totalEmissionsGrouped = Array.from(
        powerProductions
          .reduce(
            (map, entity) => map.set(entity.name, (map.get(entity.name) ?? 0) + entity.result),
            new Map<string, number>(),
          )
          .entries(),
      ).map(([energySource, result]) => `${energySource} : ${result} ${UNIT_G_CO2}`);

      const totalEmissionsByKgHydrogen = totalEmissions / bottledHydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsByKgHydrogen,
          UNIT_G_CO2_PER_KG_H2,
          CalculationTopic.POWER_SUPPLY,
        ),
      );
    }

    if (provenance.waterConsumptions) {
      const waterConsumptions: ProofOfSustainabilityEmissionCalculationEntity[] = provenance.waterConsumptions.map(
        (waterConsumption) => EmissionAssembler.assembleWaterSupply(waterConsumption),
      );

      const totalEmissions = waterConsumptions.reduce((acc, wc) => acc + wc.result, 0);
      const totalEmissionsGrouped = [`${totalEmissions} ${UNIT_G_CO2}`];
      const totalEmissionsByKgHydrogen = totalEmissions / bottledHydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsByKgHydrogen,
          UNIT_G_CO2_PER_KG_H2,
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
      ).map(([color, result]) => `${color} : ${result} ${UNIT_G_CO2}`);

      const totalEmissionsByKgHydrogen = totalEmissions / bottledHydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsByKgHydrogen,
          UNIT_G_CO2_PER_KG_H2,
          CalculationTopic.HYDROGEN_STORAGE,
        ),
      );
    }

    if (provenance.hydrogenBottling) {
      const hydrogenBottling: ProofOfSustainabilityEmissionCalculationEntity =
        EmissionAssembler.assembleHydrogenBottling(provenance.hydrogenBottling);

      const totalEmissions = hydrogenBottling.result;
      const totalEmissionsGrouped = [`${totalEmissions} ${UNIT_G_CO2}`];
      const totalEmissionsByKgHydrogen = totalEmissions / bottledHydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsByKgHydrogen,
          UNIT_G_CO2_PER_KG_H2,
          CalculationTopic.HYDROGEN_BOTTLING,
        ),
      );
    }

    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenTransportation: ProofOfSustainabilityEmissionCalculationEntity =
        EmissionAssembler.assembleHydrogenTransportation(provenance.root);

      const totalEmissions = hydrogenTransportation.result;
      const totalEmissionsGrouped = [`${totalEmissions} ${UNIT_G_CO2}`];
      const totalEmissionsByKgHydrogen = totalEmissions / bottledHydrogenAmount;

      emissionCalculations.push(
        new ProofOfSustainabilityEmissionCalculationEntity(
          totalEmissions.toString(),
          totalEmissionsGrouped,
          totalEmissionsByKgHydrogen,
          UNIT_G_CO2_PER_KG_H2,
          CalculationTopic.HYDROGEN_TRANSPORTATION,
        ),
      );
    }

    return EmissionAssembler.assembleProofOfSustainability(
      provenance.root.id,
      emissionCalculations,
      provenance.hydrogenBottling.batch.amount,
    );
  }

  async computePowerSupplyEmissions(
    powerProductions: ProcessStepEntity[],
  ): Promise<ProofOfSustainabilityEmissionCalculationEntity[]> {
    if (!powerProductions.length) {
      return [];
    }

    const unitIds = Array.from(new Set(powerProductions.map((p) => p.executedBy.id)));

    const units: PowerProductionUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS, new ReadByIdsPayload(unitIds)),
    );

    const unitsById = new Map<string, PowerProductionUnitEntity>(units.map((u) => [u.id, u]));
    for (const unitId of unitIds) {
      if (!unitsById.has(unitId)) {
        throw new Error(`PowerProductionUnit [${unitId}] not found.`);
      }
    }

    return powerProductions.map((powerProduction) => {
      const unit = unitsById.get(powerProduction.executedBy.id)!;
      return EmissionAssembler.assemblePowerSupply(powerProduction, unit.type.energySource);
    });
  }
}
