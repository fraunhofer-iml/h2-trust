/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeneralInformationEntity, ProofOfOriginSectionEntity, ProofOfSustainabilityEntity } from '@h2-trust/amqp';
import { FileInfoDto } from '../file/file-info.dto';
import { HydrogenComponentDto } from './general-information/hydrogen-component.dto';
import { GridEnergyRfnboDto, RenewableEnergyRfnboDto, RfnboBaseDto } from './general-information/rfnbo-compliance.dto';
import { SectionDto } from './proof-of-origin';
import { ProofOfSustainabilityDto } from './proof-of-sustainability';

export class ProductPassportDto {
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
    this.product = 'Hydrogen';
    this.attachedFiles = attachedFiles;
    this.rfnboCompliance = rfnboCompliance;
    this.proofOfOrigin = proofOfOrigin;
    this.proofOfSustainability = proofOfSustainability;
  }

  static fromEnities(
    generalInformationEntity: GeneralInformationEntity,
    proofOfOriginSectionEntities: ProofOfOriginSectionEntity[],
    proofOfSustainabilityEntity: ProofOfSustainabilityEntity,
  ): ProductPassportDto {
    const hydrogenComposition = (generalInformationEntity.hydrogenComposition ?? []).map(
      HydrogenComponentDto.fromEntity,
    );
    const attachedFiles = (generalInformationEntity.attachedFiles ?? []).map(
      (document) => new FileInfoDto(document.description, document.location),
    );

    const proofOfSustainability = ProofOfSustainabilityDto.fromEntity(proofOfSustainabilityEntity);
    const proofOfOrigin = SectionDto.fromEntities(proofOfOriginSections);

    const gridPowerUsed = hydrogenComposition.find((element: HydrogenComponentDto) => element.color ===  HydrogenColor.YELLOW);
    const isEmissionReductionAbove70Percent = proofOfSustainabilityEntity.emissionReductionPercentage > 70;
    const rfnboCompliance = gridPowerUsed
      ? new GridEnergyRfnboDto(isEmissionReductionAbove70Percent, false, false, false)
      : new RenewableEnergyRfnboDto(
          isEmissionReductionAbove70Percent,
          generalInformationEntity.redCompliance.isGeoCorrelationValid,
          generalInformationEntity.redCompliance.isTimeCorrelationValid,
          generalInformationEntity.redCompliance.isAdditionalityFulfilled,
          generalInformationEntity.redCompliance.financialSupportReceived,
        );

    return new ProductPassportDto(
      generalInformationEntity.id,
      generalInformationEntity.filledAt,
      generalInformationEntity.owner ?? '',
      generalInformationEntity.filledAmount ?? 0,
      generalInformationEntity.color ?? '',
      generalInformationEntity.producer ?? '',
      hydrogenComposition,
      attachedFiles,
      rfnboCompliance,
      proofOfSustainability,
      proofOfOrigin,
    );
  }
}
