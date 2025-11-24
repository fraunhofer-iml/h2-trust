/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from './process-step.entity';

export class ProvenanceEntity {
  root: ProcessStepEntity;
  hydrogenBottling?: ProcessStepEntity;
  hydrogenProductions?: ProcessStepEntity[];
  waterConsumptions?: ProcessStepEntity[];
  powerProductions?: ProcessStepEntity[];

  constructor(
    root: ProcessStepEntity,
    hydrogenBottling?: ProcessStepEntity,
    hydrogenProductions?: ProcessStepEntity[],
    waterConsumptions?: ProcessStepEntity[],
    powerProductions?: ProcessStepEntity[],
  ) {
    this.root = root;
    this.hydrogenBottling = hydrogenBottling;
    this.hydrogenProductions = hydrogenProductions;
    this.waterConsumptions = waterConsumptions;
    this.powerProductions = powerProductions;
  }
}
