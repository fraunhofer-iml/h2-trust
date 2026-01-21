/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeneralInformationEntity } from '@h2-trust/amqp';
import { FileInfoDto } from '../../file/file-info.dto';
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
  }

  static fromEntity(entity: GeneralInformationEntity): GeneralInformationDto {
    const hydrogenComposition = (entity.hydrogenComposition ?? []).map(HydrogenComponentDto.fromEntity);
    const attachedFiles = (entity.attachedFiles ?? []).map(
      (document) => new FileInfoDto(document.description, document.location),
    );

    const gridPowerUsed = hydrogenComposition.find((element: HydrogenComponentDto) => element.color === 'YELLOW');
    // TODO: use the emisisn reduction value here
    const isReductionOver70Percent = true;

    const rfnboCompliance = gridPowerUsed
      ? new GridEnergyRfnboDto(isReductionOver70Percent, false, false, false)
      : new RenewableEnergyRfnboDto(
          isReductionOver70Percent,
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
    );
  }
}
