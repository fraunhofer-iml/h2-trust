/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadByIdPayload, ProvenanceEntity } from "@h2-trust/amqp";
import { SectionDto } from "@h2-trust/api";
import { ProcessType } from "@h2-trust/domain";
import { Injectable } from "@nestjs/common";
import { ProvenanceService } from "../provenance/provenance.service";
import { HydrogenBottlingSectionService } from "./hydrogen-bottling-section.service";
import { HydrogenProductionSectionService } from "./hydrogen-production-section.service";
import { HydrogenStorageSectionService } from "./hydrogen-storage-section.service";
import { HydrogenTransportationSectionService } from "./hydrogen-transportation-section.service";

@Injectable()
export class ProofOfOriginService {
  constructor(
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly hydrogenStorageSectionService: HydrogenStorageSectionService,
    private readonly hydrogenBottlingSectionService: HydrogenBottlingSectionService,
    private readonly hydrogenTransportationSectionService: HydrogenTransportationSectionService,
    private readonly provenanceService: ProvenanceService,
  ) { }

  async buildProofOfOrigin(payload: ReadByIdPayload): Promise<SectionDto[]> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(payload);
    const sectionPromises: Array<Promise<SectionDto>> = [];

    const hydrogenProductionPromise =
      provenance.powerProductions?.length || provenance.waterConsumptions?.length
        ? this.hydrogenProductionSectionService.buildSection(
          provenance.powerProductions,
          provenance.waterConsumptions,
          provenance.hydrogenBottling.batch.amount,
        )
        : Promise.resolve(undefined);

    const hydrogenStoragePromise = provenance.hydrogenProductions?.length
      ? this.hydrogenStorageSectionService.buildSection(provenance.hydrogenProductions)
      : Promise.resolve(undefined);

    const hydrogenBottlingPromise =
      provenance.root.type === ProcessType.HYDROGEN_BOTTLING ||
        provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION
        ? this.hydrogenBottlingSectionService.buildSection(provenance.hydrogenBottling ?? provenance.root)
        : Promise.resolve(undefined);

    const hydrogenTransportationPromise =
      provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION && provenance.hydrogenBottling
        ? this.hydrogenTransportationSectionService.buildSection(provenance.root, provenance.hydrogenBottling)
        : Promise.resolve(undefined);

    sectionPromises.push(
      hydrogenProductionPromise,
      hydrogenStoragePromise,
      hydrogenBottlingPromise,
      hydrogenTransportationPromise,
    );

    const sections = await Promise.all(sectionPromises);
    return sections.filter((section) => section !== undefined);
  }
}
