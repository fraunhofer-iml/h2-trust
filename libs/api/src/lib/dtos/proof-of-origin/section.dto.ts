/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProofOfOriginBatchEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginPowerBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfOriginWaterBatchEntity,
} from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
import { HydrogenComponentDto } from '../process-step';
import { BatchDto } from './batch.dto';
import { ClassificationDto } from './classification.dto';
import { EmissionDto } from './emission.dto';
import { HydrogenBatchDto } from './hydrogen-batch.dto';
import { PowerBatchDto } from './power-batch.dto';
import { WaterBatchDto } from './water-batch.dto';
import { WaterDetailsDto } from './water-details.dto';

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
    return (entities ?? []).map((section) => SectionDto.toSectionDto(section));
  }

  private static toSectionDto(section: ProofOfOriginSectionEntity): SectionDto {
    const batches = (section.batches ?? []).map((batch) => SectionDto.toBatchDto(batch));
    const classifications = (section.classifications ?? []).map((classification) =>
      SectionDto.toClassificationDto(classification),
    );

    return new SectionDto(section.name, batches, classifications);
  }

  private static toBatchDto(batch: ProofOfOriginBatchEntity): BatchDto {
    switch (batch.batchType) {
      case BatchType.POWER:
        return this.toPowerBatch(batch as ProofOfOriginPowerBatchEntity);
      case BatchType.WATER:
        return this.toWaterBatchDto(batch as ProofOfOriginWaterBatchEntity);
      case BatchType.HYDROGEN:
        return this.toHydrogenBatchDto(batch as ProofOfOriginHydrogenBatchEntity);
      default:
        throw new Error(`Unsupported batch type: ${batch.batchType}`);
    }
  }

  private static toPowerBatch(batch: ProofOfOriginPowerBatchEntity): PowerBatchDto {
    const emission = this.toEmissionDto(batch.emission);

    return new PowerBatchDto(
      batch.id,
      emission,
      batch.createdAt,
      batch.amount,
      batch.unit,
      batch.amount, // TODO-MP: was previously null
      batch.producer ?? '',
      batch.unitId ?? '',
      batch.energySource,
      batch.accountingPeriodEnd,
    );
  }

  private static toWaterBatchDto(batch: ProofOfOriginWaterBatchEntity): WaterBatchDto {
    const emission = this.toEmissionDto(batch.emission);

    return new WaterBatchDto(
      batch.id,
      emission,
      batch.createdAt,
      batch.amount,
      batch.unit,
      this.toWaterDetailsDto(batch),
    );
  }

  private static toWaterDetailsDto(batch: ProofOfOriginWaterBatchEntity): WaterDetailsDto {
    const amount = batch.deionizedWater?.amount ?? 0;
    const emission = this.toEmissionDto(batch.deionizedWater?.emission);

    return new WaterDetailsDto(amount, emission);
  }

  private static toHydrogenBatchDto(batch: ProofOfOriginHydrogenBatchEntity): HydrogenBatchDto {
    const emission = this.toEmissionDto(batch.emission);
    const hydrogenComposition = (batch.hydrogenComposition ?? []).map(HydrogenComponentDto.of);

    return new HydrogenBatchDto(
      batch.id,
      emission,
      batch.createdAt,
      batch.amount,
      batch.unit,
      batch.amount, // TODO-MP: was previously null
      batch.producer ?? '',
      batch.unitId ?? '',
      0,
      '',
      hydrogenComposition,
      batch.color ?? '',
      false,
      batch.processStep ?? '',
      batch.accountingPeriodEnd,
    );
  }

  private static toClassificationDto(classification: ProofOfOriginClassificationEntity): ClassificationDto {
    const batches = (classification.batches ?? []).map((batch) => SectionDto.toBatchDto(batch));
    const nestedClassifications = (classification.classifications ?? []).map((classification) =>
      SectionDto.toClassificationDto(classification),
    );

    return new ClassificationDto(
      classification.name,
      classification.emissionOfProcessStep,
      classification.amount,
      classification.amount, // TODO-MP: was previously null
      batches,
      nestedClassifications,
      classification.unit,
      classification.classificationType,
    );
  }

  private static toEmissionDto(emission?: ProofOfOriginEmissionEntity): EmissionDto {
    if (!emission) {
      return new EmissionDto(0, 0, []);
    }

    return new EmissionDto(emission.amountCO2 ?? 0, emission.amountCO2PerKgH2 ?? 0, emission.basisOfCalculation ?? []);
  }
}
