/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { BrokerQueues, LineageContextEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProcessLineageService } from './process-lineage.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LineageContextService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    private readonly lineage: ProcessLineageService,
  ) { }

  async build(processStepId: string): Promise<LineageContextEntity> {
    const processStep = await firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }));
    switch (processStep.type) {
      case ProcessType.POWER_PRODUCTION:
        return this.buildForPowerProduction(processStep);
      case ProcessType.HYDROGEN_PRODUCTION:
        return this.buildForHydrogenProduction(processStep);
      case ProcessType.HYDROGEN_BOTTLING:
        return this.buildForHydrogenBottling(processStep);
      case ProcessType.HYDROGEN_TRANSPORTATION:
        return this.buildForHydrogenTransportation(processStep);
      default:
        throw new Error(`ProcessStep with ID ${processStep.id} has an invalid process type: ${processStep.type}`);
    }
  }

  private async buildForPowerProduction(processStep: ProcessStepEntity): Promise<LineageContextEntity> {
    return {
      root: processStep,
      hydrogenProductionProcessSteps: [],
      waterConsumptionProcessSteps: [],
      powerProductionProcessSteps: [processStep],
    };
  }

  private async buildForHydrogenProduction(processStep: ProcessStepEntity): Promise<LineageContextEntity> {
    const powerProductionProcessSteps = await this.lineage.fetchPowerProductionProcessSteps([processStep]);
    const waterConsumptionProcessSteps = await this.lineage.fetchWaterConsumptionProcessSteps([processStep]);
    return {
      root: processStep,
      hydrogenProductionProcessSteps: [processStep],
      waterConsumptionProcessSteps,
      powerProductionProcessSteps,
    };
  }

  private async buildForHydrogenBottling(processStep: ProcessStepEntity): Promise<LineageContextEntity> {
    const hydrogenProductionProcessSteps = await this.lineage.fetchHydrogenProductionProcessSteps(processStep);
    const powerProductionProcessSteps =
      await this.lineage.fetchPowerProductionProcessSteps(hydrogenProductionProcessSteps);
    const waterConsumptionProcessSteps =
      await this.lineage.fetchWaterConsumptionProcessSteps(hydrogenProductionProcessSteps);
    return {
      root: processStep,
      hydrogenBottlingProcessStep: processStep,
      hydrogenProductionProcessSteps,
      waterConsumptionProcessSteps,
      powerProductionProcessSteps,
    };
  }

  private async buildForHydrogenTransportation(processStep: ProcessStepEntity): Promise<LineageContextEntity> {
    const hydrogenBottlingProcessStep = await this.lineage.fetchHydrogenBottlingProcessStep(processStep);
    const hydrogenProductionProcessSteps =
      await this.lineage.fetchHydrogenProductionProcessSteps(hydrogenBottlingProcessStep);
    const powerProductionProcessSteps =
      await this.lineage.fetchPowerProductionProcessSteps(hydrogenProductionProcessSteps);
    const waterConsumptionProcessSteps =
      await this.lineage.fetchWaterConsumptionProcessSteps(hydrogenProductionProcessSteps);
    return {
      root: processStep,
      hydrogenBottlingProcessStep,
      hydrogenProductionProcessSteps,
      waterConsumptionProcessSteps,
      powerProductionProcessSteps,
    };
  }
}
