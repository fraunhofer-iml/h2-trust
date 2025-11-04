/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from './process-step.entity';

export class LineageContextEntity {
  root: ProcessStepEntity;
  hydrogenBottlingProcessStep?: ProcessStepEntity;
  hydrogenProductionProcessSteps: ProcessStepEntity[];
  powerProductionProcessSteps: ProcessStepEntity[];

  constructor(
    root: ProcessStepEntity,
    hydrogenProductionProcessSteps: ProcessStepEntity[],
    powerProductionProcessSteps: ProcessStepEntity[],
    hydrogenBottlingProcessStep?: ProcessStepEntity,
  ) {
    this.root = root;
    this.hydrogenProductionProcessSteps = hydrogenProductionProcessSteps;
    this.powerProductionProcessSteps = powerProductionProcessSteps;
    this.hydrogenBottlingProcessStep = hydrogenBottlingProcessStep;
  }
}
