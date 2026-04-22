/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DigitalProductPassportEntity } from '@h2-trust/contracts/entities';
import { BatchType, HydrogenColor, PowerType } from '@h2-trust/domain';
import { FileInfoDto } from '../file/file-info.dto';
import { HydrogenComponentDto } from './general-information/hydrogen-component.dto';
import { GridEnergyRfnboDto, RenewableEnergyRfnboDto, RfnboBaseDto } from './general-information/rfnbo-compliance.dto';
import { SectionDto } from './proof-of-origin';
import { ProofOfSustainabilityDto } from './proof-of-sustainability';

export class DigitalProductPassportDto {
  id: string;
  filledAt: Date;
  owner?: string;
  filledAmount?: number;
  color?: HydrogenColor;
  producer?: string;
  product: string;
  hydrogenComposition: HydrogenComponentDto[];
  attachedFiles: FileInfoDto[];
  rfnboCompliance: RfnboBaseDto;
  proofOfSustainability: ProofOfSustainabilityDto;
  proofOfOrigin: SectionDto[];

  constructor(
    id: string,
    timestamp: Date,
    owner: string,
    filledAmount: number,
    color: HydrogenColor,
    producer: string,
    hydrogenComposition: HydrogenComponentDto[],
    attachedFiles: FileInfoDto[],
    rfnboCompliance: RfnboBaseDto,
    proofOfSustainability: ProofOfSustainabilityDto,
    proofOfOrigin: SectionDto[],
  ) {
    this.id = id;
    this.filledAt = timestamp;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.color = color;
    this.producer = producer;
    this.hydrogenComposition = hydrogenComposition;
    this.product = BatchType.HYDROGEN;
    this.attachedFiles = attachedFiles;
    this.rfnboCompliance = rfnboCompliance;
    this.proofOfOrigin = proofOfOrigin;
    this.proofOfSustainability = proofOfSustainability;
  }

  static fromEntity(entity: DigitalProductPassportEntity): DigitalProductPassportDto {
    const hydrogenComposition = (entity.hydrogenComposition ?? []).map(HydrogenComponentDto.fromEntity);

    const attachedFiles = (entity.attachedFiles ?? []).map(
      (document) => new FileInfoDto(document.fileName, `${document.storageUrl}`),
    );

    const proofOfSustainability = ProofOfSustainabilityDto.fromEntity(entity.proofOfSustainability);

    const proofOfOrigin = SectionDto.fromEntities(entity.proofOfOrigin);

    const rfnboCompliance =
      entity.powerType == PowerType.NON_RENEWABLE
        ? new GridEnergyRfnboDto(entity.isEmissionReductionAbove70Percent, false, false, false)
        : new RenewableEnergyRfnboDto(
            entity.isEmissionReductionAbove70Percent,
            entity.redCompliance.isGeoCorrelationValid,
            entity.redCompliance.isTimeCorrelationValid,
            entity.redCompliance.isAdditionalityFulfilled,
            entity.redCompliance.financialSupportReceived,
          );

    return new DigitalProductPassportDto(
      entity.id,
      entity.filledAt,
      entity.owner ?? '',
      entity.filledAmount ?? 0,
      entity.color ?? HydrogenColor.MIX,
      entity.producer ?? '',
      hydrogenComposition,
      attachedFiles,
      rfnboCompliance,
      proofOfSustainability,
      proofOfOrigin,
    );
  }
}
