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
import { RedComplianceDto } from './red-compliance.dto';

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
  redCompliance: RedComplianceDto;

  constructor(
    id: string,
    timestamp: Date,
    owner: string,
    filledAmount: number,
    color: string,
    producer: string,
    hydrogenComposition: HydrogenComponentDto[],
    attachedFiles: FileInfoDto[],
    redCompliance: RedComplianceDto,
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
    this.redCompliance = redCompliance;
  }

  static fromEntity(entity: GeneralInformationEntity): GeneralInformationDto {
    const hydrogenComposition = (entity.hydrogenComposition ?? []).map(HydrogenComponentDto.fromEntity);
    const attachedFiles = (entity.attachedFiles ?? []).map(
      (document) => new FileInfoDto(document.description, document.location),
    );
    const redCompliance = entity.redCompliance
      ? new RedComplianceDto(
        entity.redCompliance.isGeoCorrelationValid,
        entity.redCompliance.isTimeCorrelationValid,
        entity.redCompliance.isAdditionalityFulfilled,
        entity.redCompliance.financialSupportReceived,
      )
      : new RedComplianceDto(false, false, false, false);

    return new GeneralInformationDto(
      entity.id,
      entity.filledAt,
      entity.owner ?? '',
      entity.filledAmount ?? 0,
      entity.color ?? '',
      entity.producer ?? '',
      hydrogenComposition,
      attachedFiles,
      redCompliance,
    );
  }
}
