/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from './process-step.entity';

export class ProvenanceEntity {
  /**
   * Deprecated: prefer using entry points (hydrogenTransportations/hydrogenBottlings) from arrays
   */
  root: ProcessStepEntity;
  /**
   * Legacy singular accessor. Prefer hydrogenBottlings[]
   */
  hydrogenBottling?: ProcessStepEntity;
  hydrogenProductions?: ProcessStepEntity[];
  waterConsumptions?: ProcessStepEntity[];
  powerProductions?: ProcessStepEntity[];
  // New: normalized arrays for consistency with DAG reality
  hydrogenTransportations?: ProcessStepEntity[];
  hydrogenBottlings?: ProcessStepEntity[];

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
    // Best-effort normalization for legacy constructor
    this.hydrogenBottlings = hydrogenBottling ? [hydrogenBottling] : [];
    // If root is a transportation step, expose it also via array for consumers
    if ((root as any)?.type === 'HYDROGEN_TRANSPORTATION') {
      this.hydrogenTransportations = [root];
    } else {
      this.hydrogenTransportations = [];
    }
  }
}
