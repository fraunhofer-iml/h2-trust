/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { FileInfoDto } from '../file/file-info.dto';
import { BottlingOverviewDto } from './bottling-overview.dto';
import { HydrogenComponentDto } from './hydrogen-component.dto';
import { RedComplianceDto } from './red-compliance.dto';

export class GeneralInformationDto extends BottlingOverviewDto {
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
    super(id, timestamp, owner, filledAmount, color);
    this.producer = producer;
    this.hydrogenComposition = hydrogenComposition;
    this.product = 'Hydrogen';
    this.attachedFiles = attachedFiles;
    this.redCompliance = redCompliance;
  }

  static fromEntityToDto(processStep: ProcessStepEntity): GeneralInformationDto {
    return <GeneralInformationDto>{
      id: processStep.id,
      filledAt: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      color: processStep.batch?.quality,
      producer: processStep.recordedBy?.id,
      product: 'Hydrogen',
      attachedFiles:
        processStep.documents?.map((document) => new FileInfoDto(document.description, document.location)) || [],
      redCompliance: new RedComplianceDto(true, true, false),
    };
  }
}
