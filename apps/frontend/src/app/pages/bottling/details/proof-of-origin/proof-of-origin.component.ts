/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { BatchDto, HydrogenBatchDto, PowerBatchDto, SectionDto, WaterBatchDto } from '@h2-trust/api';
import { BatchType } from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { H2BatchCardComponent } from './batch-card/h2-batch-card/h2-batch-card.component';
import { PowerBatchCardComponent } from './batch-card/power-batch-card/power-batch-card.component';
import { WaterBatchCardComponent } from './batch-card/water-batch-card/water-batch-card.component';
import { ClassificationComponent } from './classification/classification.component';

@Component({
  selector: 'app-proof-of-origin',
  imports: [
    CommonModule,
    ClassificationComponent,
    PrettyEnumPipe,
    WaterBatchCardComponent,
    H2BatchCardComponent,
    PowerBatchCardComponent,
  ],
  templateUrl: './proof-of-origin.component.html',
})
export class ProofOfOriginComponent {
  proofOfOrigin$ = input<SectionDto[]>();

  sectionIndex$ = signal(-2);
  classificationIndex$ = signal<number[]>([0]);

  data$ = computed((): { sections: SectionDto[]; breadcrumbs: string[] } => {
    const sectionIndex = this.sectionIndex$();
    const classificationIndexes = this.classificationIndex$();
    const data = this.proofOfOrigin$();
    const breadcrumbs: string[] = [];

    if (sectionIndex > -1 && classificationIndexes.length > 0 && data) {
      let classification = data[sectionIndex];
      for (const index of classificationIndexes) {
        classification = classification.classifications[index];
        breadcrumbs.push(classification.name);
      }

      if (!classification) return { sections: data, breadcrumbs: breadcrumbs };

      const result: SectionDto[] = [
        {
          name: classification.name,
          batches: classification.batches,
          classifications: classification.classifications,
        },
      ];

      return { sections: result, breadcrumbs: breadcrumbs };
    }

    return { sections: data ?? [], breadcrumbs: breadcrumbs };
  });

  setIndex(sectionIndex: number, classificationIndex: number) {
    this.sectionIndex$.set(sectionIndex);
    this.classificationIndex$.set([...this.classificationIndex$(), classificationIndex]);
  }

  navigate(index: number) {
    this.classificationIndex$.set(this.classificationIndex$().slice(0, index + 1));
  }

  back() {
    const length = this.classificationIndex$().length;
    if (length === 0) return;
    this.navigate(length - 2);
  }

  isInstanceOfWaterBatch(batch: BatchDto): WaterBatchDto | null {
    return batch.batchType === BatchType.WATER ? (batch as WaterBatchDto) : null;
  }
  isInstanceOfHydrogenBatch(batch: BatchDto): HydrogenBatchDto | null {
    return batch.batchType === BatchType.HYDROGEN ? (batch as HydrogenBatchDto) : null;
  }
  isInstanceOfPowerBatch(batch: BatchDto): PowerBatchDto | null {
    return batch.batchType === BatchType.POWER ? (batch as PowerBatchDto) : null;
  }
}
