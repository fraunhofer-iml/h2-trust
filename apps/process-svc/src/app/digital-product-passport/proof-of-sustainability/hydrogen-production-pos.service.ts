/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfSustainabilityEmissionCalculationEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/api';
import { CalculationTopic, HydrogenColor, MeasurementUnit } from '@h2-trust/domain';
import { HydrogenStoragePosService } from './hydrogen-storage-pos.service';

export class HydrogenProductionPosService {
  public static computeProvenanceEmissionsForHydrogenProduction(
    provenance: ProvenanceEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (!provenance || !provenance.getAllHydrogenLeafProductions()) {
      throw new Error('Provenance or hydrogen productions is undefined.');
    }

    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    const hydrogenStorages: ProofOfSustainabilityEmissionCalculationEntity[] = provenance
      .getAllHydrogenLeafProductions()
      .map((hydrogenProduction) => HydrogenStoragePosService.computeEmissionsForHydrogenStorage(hydrogenProduction));

    const totalEmissions = hydrogenStorages.reduce((sum, curr) => sum + curr.result, 0);

    const totalEmissionsGrouped = Array.from(
      provenance
        .getAllHydrogenLeafProductions()
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
}
