/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { CreateProductionEntity, ProcessStepEntity, RootProductionEntity, UnitEntity } from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { RfnboType } from '@h2-trust/domain';
import { DigitalProductPassportService } from '../digital-product-passport/digital-product-passport.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionAssembler } from './production.assembler';

@Injectable()
export class ProductionCreationService {
  private readonly productionChunkSize: number;
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly processStepService: ProcessStepService,
    private readonly digitalProductPassportService: DigitalProductPassportService,
  ) {
    this.productionChunkSize = this.configurationService.getProcessSvcConfiguration().productionChunkSize;
  }

  public async createAndPersistProductions(
    createProductions: CreateProductionEntity[],
    productionUnitsForId: Map<string, UnitEntity>,
  ): Promise<ProcessStepEntity[]> {
    const persistedProcessSteps: ProcessStepEntity[] = [];

    const rootProductionsToCreate: RootProductionEntity[] = createProductions.map((createProduction) =>
      ProductionAssembler.assembleRootProductions(createProduction, productionUnitsForId),
    );

    for (let i = 0; i < rootProductionsToCreate.length; i += this.productionChunkSize) {
      const createRootProductionsChunk: RootProductionEntity[] = rootProductionsToCreate.slice(
        i,
        i + this.productionChunkSize,
      );

      createRootProductionsChunk.map((rootProduction) => {
        const rfnboType: RfnboType =
          this.digitalProductPassportService.getRfnboForHydrogenRootProduction(rootProduction);
        rootProduction.hydrogenProduction.batch.qualityDetails.rfnboType = rfnboType;
        return rootProduction;
      });

      const persistedProcessSteps: ProcessStepEntity[] =
        await this.processStepService.createRootProductionProcessSteps(createRootProductionsChunk);

      persistedProcessSteps.push(...persistedProcessSteps);
    }

    return persistedProcessSteps;
  }
}
