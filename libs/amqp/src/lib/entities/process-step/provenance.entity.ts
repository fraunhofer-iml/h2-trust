/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionChainEntity } from '../production';
import { ProcessStepEntity } from './process-step.entity';

export class ProvenanceEntity {
  root: ProcessStepEntity;
  hydrogenBottling?: ProcessStepEntity;
  productionChains: ProductionChainEntity[];

  constructor(root: ProcessStepEntity, productionChain: ProductionChainEntity[], hydrogenBottling?: ProcessStepEntity) {
    this.root = root;
    this.hydrogenBottling = hydrogenBottling;
    this.productionChains = productionChain;
  }

  public static fromProductionChain(productionChain: ProductionChainEntity): ProvenanceEntity {
    return new ProvenanceEntity(productionChain.hydrogenRootProduction, [productionChain]);
  }

  public getAllPowerProductions(): ProcessStepEntity[] {
    return this.productionChains.map((productionChain) => productionChain.powerProduction);
  }

  public getAllWaterConsumptions(): ProcessStepEntity[] {
    return this.productionChains.map((productionChain) => productionChain.waterConsumption);
  }

  public getAllHydrogenRootProductions(): ProcessStepEntity[] {
    return this.productionChains.map((productionChain) => productionChain.hydrogenRootProduction);
  }

  public getAllHydrogenLeafProductions(): ProcessStepEntity[] {
    return this.productionChains.map((productionChain) => productionChain.hydrogenLeafProduction);
  }
}
