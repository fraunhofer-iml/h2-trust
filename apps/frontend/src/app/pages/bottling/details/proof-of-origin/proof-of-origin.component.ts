/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { BatchDto, ClassificationDto, HydrogenBatchDto, PowerBatchDto, SectionDto, WaterBatchDto } from '@h2-trust/api';
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

  sectionIndex$ = signal(-1);
  classificationIndex$ = signal<number[]>([]);

  data$ = computed((): { sections: SectionDto[]; breadcrumbs: string[] } => {
    const sectionIndex = this.sectionIndex$();
    const classificationIndexes = this.classificationIndex$();
    const sections = this.proofOfOrigin$();
    const breadcrumbs: string[] = [];

    if (sectionIndex <= -1 || !sections || classificationIndexes.length <= 0)
      return { sections: sections ?? [], breadcrumbs: breadcrumbs };

    let item: ClassificationDto | SectionDto = sections[sectionIndex];
    if (!item) return { sections: sections, breadcrumbs: breadcrumbs };

    for (const index of classificationIndexes) {
      item = item.classifications[index];
      breadcrumbs.push(item.name);
    }

    const sectionsToShow: SectionDto[] = [
      {
        name: item.name,
        batches: item.batches,
        classifications: item.classifications,
      },
    ];

    return { sections: sectionsToShow, breadcrumbs: breadcrumbs };
  });

  setIndex(sectionIndex: number, classificationIndex: number) {
    this.sectionIndex$.set(sectionIndex);
    this.classificationIndex$.set([...this.classificationIndex$(), classificationIndex]);
  }

  navigate(index: number) {
    this.classificationIndex$.set(this.classificationIndex$().slice(0, index + 1));
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
