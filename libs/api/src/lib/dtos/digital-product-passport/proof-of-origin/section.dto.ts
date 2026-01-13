/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginPowerBatchEntity,
  ProofOfOriginBatchEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginSectionEntity,
  ProofOfOriginSubClassificationEntity,
  ProofOfOriginWaterBatchEntity,
} from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
import { BatchDto } from './batch.dto';
import { ClassificationDto } from './classification.dto';
import { EmissionDto } from './emission.dto';
import { HydrogenBatchDto } from './hydrogen-batch.dto';
import { PowerBatchDto } from './power-batch.dto';
import { WaterBatchDto } from './water-batch.dto';
import { WaterDetailsDto } from './water-details.dto';
import { HydrogenComponentDto } from '../general-information';

/**
 * top level sections of proof of origin
 * @example input media, bottling, sale etc.
 */
export class SectionDto {
  name: string;
  batches: BatchDto[];
  classifications: ClassificationDto[];

  constructor(name: string, batches: BatchDto[], classifications: ClassificationDto[]) {
    this.name = name;
    this.batches = batches;
    this.classifications = classifications;
  }

  static fromEntities(entities: ProofOfOriginSectionEntity[]): SectionDto[] {
    return (entities ?? [])
      .map((section) => SectionDto.fromEntity(section));
  }

  private static fromEntity(section: ProofOfOriginSectionEntity): SectionDto {
    const batches = (section.batches ?? [])
      .map((batch) => SectionDto.fromBatchEntity(batch));

    const classifications = (section.classifications ?? [])
      .map((classification) => SectionDto.fromClassificationEntity(classification));

    return new SectionDto(section.name, batches, classifications);
  }

  private static fromBatchEntity(batch: ProofOfOriginBatchEntity): BatchDto {
    switch (batch.batchType) {
      case BatchType.POWER:
        return this.fromPowerBatchEntity(batch as ProofOfOriginPowerBatchEntity);
      case BatchType.WATER:
        return this.fromWaterBatchEntity(batch as ProofOfOriginWaterBatchEntity);
      case BatchType.HYDROGEN:
        return this.fromHydrogenBatchEntity(batch as ProofOfOriginHydrogenBatchEntity);
      default:
        throw new Error(`Unsupported batch type: ${(batch as ProofOfOriginBatchEntity).batchType}`);
    }
  }

  private static fromPowerBatchEntity(batch: ProofOfOriginPowerBatchEntity): PowerBatchDto {
    const emission = this.fromEmissionEntity(batch.emission);

    return new PowerBatchDto(
      batch.id,
      emission,
      batch.createdAt,
      batch.amount,
      batch.unit,
      batch.amount, // TODO-MP: will be removed in DUHGW-310
      batch.producer ?? '',
      batch.unitId ?? '',
      batch.energySource,
      batch.accountingPeriodEnd,
    );
  }

  private static fromWaterBatchEntity(batch: ProofOfOriginWaterBatchEntity): WaterBatchDto {
    const emission = this.fromEmissionEntity(batch.emission);

    const waterDetails = new WaterDetailsDto(batch.deionizedWaterAmount ?? 0, this.fromEmissionEntity(batch.deionizedWaterEmission))

    return new WaterBatchDto(batch.id, emission, batch.createdAt, batch.amount, batch.unit, waterDetails);
  }

  private static fromHydrogenBatchEntity(batch: ProofOfOriginHydrogenBatchEntity): HydrogenBatchDto {
    const emission = this.fromEmissionEntity(batch.emission);

    const hydrogenComposition = (batch.hydrogenComposition ?? [])
      .map(HydrogenComponentDto.fromEntity);

    return new HydrogenBatchDto(
      batch.id,
      emission,
      batch.createdAt,
      batch.amount,
      batch.unit,
      batch.amount, // TODO-MP: will be removed in DUHGW-310
      batch.producer ?? '',
      batch.unitId ?? '',
      0,  // TODO-MP: will be removed in DUHGW-312
      '',
      hydrogenComposition,
      batch.color ?? '',
      false,
      batch.processStep ?? '',
      batch.accountingPeriodEnd,
    );
  }

  private static fromClassificationEntity(classification: ProofOfOriginClassificationEntity): ClassificationDto {
    const batches = (classification.batches ?? [])
      .map((batch) => SectionDto.fromBatchEntity(batch));

    const classifications = (classification.subClassifications ?? [])
      .map((sub) => SectionDto.fromSubClassificationEntity(sub));

    return new ClassificationDto(
      classification.name,
      classification.emissionOfProcessStep,
      classification.amount,
      classification.amount, // TODO-MP: will be removed in DUHGW-310
      batches,
      classifications,
      classification.unit,
      classification.classificationType,
    );
  }

  private static fromSubClassificationEntity(subClassification: ProofOfOriginSubClassificationEntity): ClassificationDto {
    const batches = (subClassification.batches ?? [])
      .map((batch) => SectionDto.fromBatchEntity(batch));

    return new ClassificationDto(
      subClassification.name,
      subClassification.emissionOfProcessStep,
      subClassification.amount,
      subClassification.amount, // TODO-MP: will be removed in DUHGW-310
      batches,
      [], // Leaf classification has no nested classifications
      subClassification.unit,
      subClassification.classificationType,
    );
  }

  private static fromEmissionEntity(emission: ProofOfOriginEmissionEntity): EmissionDto {
    return emission
      ? new EmissionDto(emission.amountCO2 ?? 0, emission.amountCO2PerKgH2 ?? 0, emission.basisOfCalculation ?? [])
      : new EmissionDto(0, 0, [])
  }
}
