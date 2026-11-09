/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ClassificationDto, DppBatchDto, SectionDto } from '@h2-trust/contracts/dtos';
import { BatchType, CalculationTopic, MeasurementUnit, ProcessType } from '@h2-trust/domain';
import { EmptyStateComponent } from '../../../layout/empty-state/empty-state.component';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { LoadingCardComponent } from '../../../layout/loading-card/loading-card.component';
import { H2TrustRouterLinks } from '../../../shared/constants/router-links';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { H2CompositionChartComponent } from './chart/h2-composition-chart.component';
import { ProofOfOriginComponent } from './proof-of-origin/proof-of-origin.component';
import { ProofOfSustainabilityComponent } from './proof-of-sustainability/proof-of-sustainability.component';
import { RfnboComplianceComponent } from './rfnbo-compliance/rfnbo-compliance.component';

@Component({
  selector: 'app-product-pass',
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    H2CompositionChartComponent,
    ProofOfOriginComponent,
    ErrorCardComponent,
    ProofOfSustainabilityComponent,
    UnitPipe,
    RfnboComplianceComponent,
    LoadingCardComponent,
    EmptyStateComponent,
    EnumPipe,
  ],
  templateUrl: './product-pass.component.html',
})
export class ProductPassComponent {
  protected readonly H2TrustRouterLinks = H2TrustRouterLinks;
  bottlingService = inject(BottlingService);
  authService = inject(AuthService);

  selectedUrl = '';
  isAuthenticated = false;

  id = input<string>('');

  readonly MeasurementUnit = MeasurementUnit;

  batchQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.BOTTLING, this.id()],
    queryFn: () => this.bottlingService.findBatchById(this.id() ?? ''),
    enabled: !!this.id(),
  }));

  protected readonly proofOfOriginCalculationTopics = computed(() => {
    const batch = this.batchQuery.data();

    return batch ? this.getCalculationTopicsFromProofOfOrigin(batch.proofOfOrigin) : [];
  });

  constructor() {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  openFile(url: string) {
    window.open(url, '_blank');
  }

  protected getCalculationTopicsFromProofOfOrigin(sections: SectionDto[]): CalculationTopic[] {
    const topics = new Set<CalculationTopic>();

    sections.forEach((section) => {
      this.collectCalculationTopics(section.batches, section.classifications, topics);
    });

    return [...topics];
  }

  private collectCalculationTopics(
    batches: DppBatchDto[],
    classifications: ClassificationDto[],
    topics: Set<CalculationTopic>,
  ): void {
    batches.forEach((batch) => {
      this.addCalculationTopicForBatch(batch, topics);
    });

    classifications.forEach((classification) => {
      this.collectCalculationTopics(classification.batches, classification.classifications, topics);
    });
  }

  private addCalculationTopicForBatch(batch: DppBatchDto, topics: Set<CalculationTopic>): void {
    switch (batch.batchType) {
      case BatchType.POWER:
        topics.add(CalculationTopic.POWER_SUPPLY);
        return;

      case BatchType.WATER:
        topics.add(CalculationTopic.WATER_SUPPLY);
        return;

      case BatchType.H2_PRODUCTION:
        topics.add(CalculationTopic.HYDROGEN_PRODUCTION);
        return;

      case BatchType.HYDROGEN:
        this.addCalculationTopicForHydrogenProcessStep(batch, topics);
        return;
    }
  }

  private addCalculationTopicForHydrogenProcessStep(batch: DppBatchDto, topics: Set<CalculationTopic>): void {
    const processStep = 'processStep' in batch ? batch.processStep : undefined;

    switch (processStep) {
      case ProcessType.HYDROGEN_STORAGE:
        topics.add(CalculationTopic.HYDROGEN_STORAGE);
        break;

      case ProcessType.HYDROGEN_BOTTLING:
        topics.add(CalculationTopic.HYDROGEN_BOTTLING);
        break;

      case ProcessType.HYDROGEN_TRANSPORTATION:
        topics.add(CalculationTopic.HYDROGEN_TRANSPORTATION);
        break;

      case ProcessType.HYDROGEN_COMPRESSION:
        topics.add(CalculationTopic.HYDROGEN_COMPRESSION);
        break;

      case ProcessType.HYDROGEN_END_USE:
        topics.add(CalculationTopic.HYDROGEN_END_USE);
        break;

      case ProcessType.HYDROGEN_PRODUCTION:
        topics.add(CalculationTopic.HYDROGEN_PRODUCTION);
        break;
    }
  }
}
