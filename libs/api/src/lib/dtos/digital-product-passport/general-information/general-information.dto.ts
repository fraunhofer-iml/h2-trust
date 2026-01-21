/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeneralInformationEntity, ProofOfOriginSectionEntity, ProofOfSustainabilityEntity } from '@h2-trust/amqp';
import { FileInfoDto } from '../../file/file-info.dto';
import { SectionDto } from '../proof-of-origin';
import { ProofOfSustainabilityDto } from '../proof-of-sustainability';
import { HydrogenComponentDto } from './hydrogen-component.dto';
import { GridEnergyRfnboDto, RenewableEnergyRfnboDto, RfnboBaseDto } from './rfnbo-compliance.dto';

export class GeneralInformationDto {
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
    entity: GeneralInformationEntity,
    proofOfOriginSections: ProofOfOriginSectionEntity[],
    proofOfSustainabilityEntity: ProofOfSustainabilityEntity,
  ): GeneralInformationDto {
    const hydrogenComposition = (entity.hydrogenComposition ?? []).map(HydrogenComponentDto.fromEntity);
    const attachedFiles = (entity.attachedFiles ?? []).map(
      (document) => new FileInfoDto(document.description, document.location),
    );

    const proofOfSustainability = ProofOfSustainabilityDto.fromEntity(proofOfSustainabilityEntity);
    const proofOfOrigin = SectionDto.fromEntities(proofOfOriginSections);

    const gridPowerUsed = hydrogenComposition.find((element: HydrogenComponentDto) => element.color === 'YELLOW');
    const isEmissionReductionOver70Percent = proofOfSustainabilityEntity.emissionReductionPercentage > 70;

    const rfnboCompliance = gridPowerUsed
      ? new GridEnergyRfnboDto(isEmissionReductionOver70Percent, false, false, false)
      : new RenewableEnergyRfnboDto(
          isEmissionReductionOver70Percent,
          entity.redCompliance.isGeoCorrelationValid,
          entity.redCompliance.isTimeCorrelationValid,
          entity.redCompliance.isAdditionalityFulfilled,
          entity.redCompliance.financialSupportReceived,
        );

    return new GeneralInformationDto(
      entity.id,
      entity.filledAt,
      entity.owner ?? '',
      entity.filledAmount ?? 0,
      entity.color ?? '',
      entity.producer ?? '',
      hydrogenComposition,
      attachedFiles,
      rfnboCompliance,
      proofOfSustainability,
      proofOfOrigin,
    );
  }
}
