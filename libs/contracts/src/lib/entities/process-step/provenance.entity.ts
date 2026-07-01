/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessType } from '@h2-trust/domain';
import { ProductionChainEntity } from '../production';
import { ProcessStepEntity } from './process-step.entity';

export class ProvenanceEntity {
  root: ProcessStepEntity;
  processStepChain: ProcessStepEntity[];
  productionChains: ProductionChainEntity[];

  constructor(
    root: ProcessStepEntity,
    processStepChain: ProcessStepEntity[],
    productionChain: ProductionChainEntity[],
  ) {
    this.root = root;
    this.processStepChain = processStepChain;
    this.productionChains = productionChain;
  }

  public static fromProductionChain(productionChain: ProductionChainEntity): ProvenanceEntity {
    return new ProvenanceEntity(productionChain.hydrogenRootProduction, [], [productionChain]);
  }

  public getProcessStepsFromChain(processType: ProcessType): ProcessStepEntity[] {
    return this.processStepChain.filter((processStep) => processStep?.type === processType);
  }

  public getAllPowerProductions(): ProcessStepEntity[] {
    return this.productionChains
      .map((productionChain) => productionChain.powerProduction)
      .filter((powerProduction) => powerProduction !== undefined);
  }

  public getAllWaterConsumptions(): ProcessStepEntity[] {
    return this.productionChains
      .map((productionChain) => productionChain.waterConsumption)
      .filter((powerProduction) => powerProduction !== undefined);
  }

  public getAllHydrogenRootProductions(): ProcessStepEntity[] {
    return this.productionChains.map((productionChain) => productionChain.hydrogenRootProduction);
  }

  public getAllHydrogenLeafProductions(): ProcessStepEntity[] {
    return this.productionChains.map((productionChain) => productionChain.hydrogenLeafProduction);
  }
}
