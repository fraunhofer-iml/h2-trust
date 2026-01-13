/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProofOfSustainabilityEmissionCalculationEntity,
  ProofOfSustainabilityEntity,
  ProofOfSustainabilityEmissionEntity,
} from '@h2-trust/amqp';
import { EmissionCalculationDto } from './emission-calculation.dto';
import { EmissionForProcessStepDto } from './process-step-emission.dto';

export class ProofOfSustainabilityDto {
  batchId: string;
  amountCO2PerMJH2: number;
  emissionReductionPercentage: number;
  calculations: EmissionCalculationDto[];
  processStepEmissions: EmissionForProcessStepDto[];

  constructor(
    batchId: string,
    amountCO2PerMJH2: number,
    emissionReductionPercentage: number,
    calculations: EmissionCalculationDto[],
    processStepEmissions: EmissionForProcessStepDto[],
  ) {
    this.batchId = batchId;
    this.amountCO2PerMJH2 = amountCO2PerMJH2;
    this.emissionReductionPercentage = emissionReductionPercentage;
    this.calculations = calculations;
    this.processStepEmissions = processStepEmissions;
  }

  static fromEntity(entity: ProofOfSustainabilityEntity): ProofOfSustainabilityDto {
    const calculations = (entity.calculations ?? [])
      .map(this.fromEmissionCalculationEntity);

    const emissions = (entity.emissions ?? [])
      .map(this.fromEmissionEntity);

    return new ProofOfSustainabilityDto(
      entity.batchId,
      entity.amountCO2PerMJH2,
      entity.emissionReductionPercentage,
      calculations,
      emissions,
    );
  }

  private static fromEmissionCalculationEntity(
    calculation: ProofOfSustainabilityEmissionCalculationEntity,
  ): EmissionCalculationDto {
    return new EmissionCalculationDto(
      calculation.name,
      calculation.basisOfCalculation,
      calculation.result,
      calculation.unit,
      calculation.calculationTopic,
    );
  }

  private static fromEmissionEntity(
    emission: ProofOfSustainabilityEmissionEntity,
  ): EmissionForProcessStepDto {
    return new EmissionForProcessStepDto(
      emission.amount,
      emission.name,
      emission.description,
      emission.emissionType,
    );
  }
}
