/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  GeneralInformationEntity,
  ReadByIdPayload,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import { BottlingService } from '../../process-step/bottling/bottling.service';
import { ProcessStepService } from '../../process-step/process-step.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class GeneralInformationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
    private readonly redComplianceService: RedComplianceService,
  ) { }

  async readGeneralInformation(processStepId: string): Promise<GeneralInformationEntity> {
    const processStep = await this.processStepService.readProcessStep(processStepId);

    const [producerName, hydrogenComposition, redCompliance] = await Promise.all([
      firstValueFrom(
        this.generalSvc.send(UserMessagePatterns.READ, new ReadByIdPayload(processStep.recordedBy?.id)),
      ).then((user) => user.company.name),
      this.bottlingService.calculateHydrogenComposition(processStep),
      this.redComplianceService.determineRedCompliance(processStepId),
    ]);

    return new GeneralInformationEntity(
      processStep.id,
      processStep.endedAt,
      processStep.batch.owner.name,
      processStep.batch.amount,
      processStep.batch.qualityDetails.color,
      producerName,
      hydrogenComposition,
      processStep.documents ?? [],
      redCompliance,
    );
  }
}
