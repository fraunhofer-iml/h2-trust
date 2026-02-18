/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DigitalProductPassportEntity } from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
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
  color?: string;
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
    color: string,
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

  static fromEnitiy(digitalProductPassportEntity: DigitalProductPassportEntity): DigitalProductPassportDto {
    const hydrogenComposition = (digitalProductPassportEntity.hydrogenComposition ?? []).map(
      HydrogenComponentDto.fromEntity,
    );
    const attachedFiles = (digitalProductPassportEntity.attachedFiles ?? []).map(
      (document) => new FileInfoDto(document.fileName, `${document.storageUrl}`),
    );

    const proofOfSustainability = ProofOfSustainabilityDto.fromEntity(
      digitalProductPassportEntity.proofOfSustainability,
    );
    const proofOfOrigin = SectionDto.fromEntities(digitalProductPassportEntity.proofOfOrigin);

    const rfnboCompliance = digitalProductPassportEntity.gridPowerUsed
      ? new GridEnergyRfnboDto(digitalProductPassportEntity.isEmissionReductionAbove70Percent, false, false, false)
      : new RenewableEnergyRfnboDto(
          digitalProductPassportEntity.isEmissionReductionAbove70Percent,
          digitalProductPassportEntity.redCompliance.isGeoCorrelationValid,
          digitalProductPassportEntity.redCompliance.isTimeCorrelationValid,
          digitalProductPassportEntity.redCompliance.isAdditionalityFulfilled,
          digitalProductPassportEntity.redCompliance.financialSupportReceived,
        );

    return new DigitalProductPassportDto(
      digitalProductPassportEntity.id,
      digitalProductPassportEntity.filledAt,
      digitalProductPassportEntity.owner ?? '',
      digitalProductPassportEntity.filledAmount ?? 0,
      digitalProductPassportEntity.color ?? '',
      digitalProductPassportEntity.producer ?? '',
      hydrogenComposition,
      attachedFiles,
      rfnboCompliance,
      proofOfSustainability,
      proofOfOrigin,
    );
  }
}
