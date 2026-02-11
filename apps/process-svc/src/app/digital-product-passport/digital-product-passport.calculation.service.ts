/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import {
  DigitalProductPassportDto,
  FileInfoDto,
  HydrogenComponentDto,
  ProofOfSustainabilityDto,
  RenewableEnergyRfnboDto,
  RfnboBaseDto,
  SectionDto,
} from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { BottlingService } from '../process-step/bottling/bottling.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { RedComplianceService } from './general-information/red-compliance/red-compliance.service';
import { EmissionService } from './proof-of-origin/emission.service';
import { HydrogenBottlingSectionService } from './proof-of-origin/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './proof-of-origin/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './proof-of-origin/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './proof-of-origin/hydrogen-transportation-section.service';
import { ProvenanceService } from './provenance/provenance.service';

/**
 * This service is intended to replace the GeneralInformationService, the ProofOfOriginService, and the ProofOfSustainabilityService, if possible.
 */
@Injectable()
export class DigitalProductPassportCalculationService {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
    private readonly redComplianceService: RedComplianceService,
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly hydrogenStorageSectionService: HydrogenStorageSectionService,
    private readonly hydrogenBottlingSectionService: HydrogenBottlingSectionService,
    private readonly hydrogenTransportationSectionService: HydrogenTransportationSectionService,
    private readonly provenanceService: ProvenanceService,
    private readonly emissionService: EmissionService,
  ) {}

  async readDPPForFillings(processStepIds: string[]): Promise<HydrogenComponentDto[]> {
    const dppResults: HydrogenComponentDto[] = [];

    for (let i: number = 0; i < processStepIds.length; i++) {
      const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepIds[i]);

      const redCompliance: RedComplianceEntity = await this.redComplianceService.determineRedCompliance(
        processStepIds[i],
      );
      const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStepIds[i]);
      const proofOfSustainability: ProofOfSustainabilityEntity =
        await this.emissionService.computeProvenanceEmissions(provenance);
      const isEmissionReductionAbove70Percent = proofOfSustainability.emissionReductionPercentage > 70;
      const rfnboReadyDto: RfnboBaseDto = new RenewableEnergyRfnboDto(
        isEmissionReductionAbove70Percent,
        redCompliance.isGeoCorrelationValid,
        redCompliance.isTimeCorrelationValid,
        redCompliance.isAdditionalityFulfilled,
        redCompliance.financialSupportReceived,
      );
      dppResults.push({
        processId: processStepIds[i],
        rfnboReady: rfnboReadyDto,
        color: processStep.batch.qualityDetails.color,
        amount: processStep.batch.amount,
      });
    }

    return dppResults;
  }

  async readDigitalProductPassport(processStepId: string): Promise<DigitalProductPassportDto> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStepId);

    const hydrogenComposition: HydrogenComponentEntity[] =
      await this.bottlingService.calculateHydrogenComposition(processStep);

    const redCompliance: RedComplianceEntity = await this.redComplianceService.determineRedCompliance(processStepId);

    //TODO-LG: Simplify to the extent that they are no longer individual promises, if possible.
    const sectionPromises: Array<Promise<ProofOfOriginSectionEntity>> = [];

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
    const proofOfOrigin: ProofOfOriginSectionEntity[] = sections.filter((section) => section !== undefined);

    //TODO-LG: compute provenance emissions should be evaluated and be made more compact if that is possible
    const proofOfSustainability: ProofOfSustainabilityEntity =
      await this.emissionService.computeProvenanceEmissions(provenance);

    const attachedFiles = (processStep.documents ?? []).map(
      (document) => new FileInfoDto(document.fileName, `${document.storageUrl}`),
    );

    const proofOfSustainabilityDto = ProofOfSustainabilityDto.fromEntity(proofOfSustainability);
    const proofOfOriginDto = SectionDto.fromEntities(proofOfOrigin);

    const isEmissionReductionAbove70Percent = proofOfSustainability.emissionReductionPercentage > 70;

    const rfnboCompliance = new RenewableEnergyRfnboDto(
      isEmissionReductionAbove70Percent,
      redCompliance.isGeoCorrelationValid,
      redCompliance.isTimeCorrelationValid,
      redCompliance.isAdditionalityFulfilled,
      redCompliance.financialSupportReceived,
    );

    //TODO-LG: Is it still necessary to take gridPowerUsed into account, given that the different colors are also to be dispensed with?
    /*
    const gridPowerUsed = hydrogenComposition.find(
      (element: HydrogenComponentDto) => element.color === HydrogenColor.YELLOW,
    );

    rfnboCompliance = gridPowerUsed
      ? new GridEnergyRfnboDto(isEmissionReductionAbove70Percent, false, false, false)
      : rfnboCompliance;
    */

    return new DigitalProductPassportDto(
      processStep.id,
      processStep.endedAt,
      processStep.batch.owner.name ?? '',
      processStep.batch.amount ?? 0,
      processStep.batch.qualityDetails.color ?? '',
      processStep.recordedBy.company.name ?? '',
      hydrogenComposition,
      attachedFiles,
      rfnboCompliance,
      proofOfSustainabilityDto,
      proofOfOriginDto,
    );
  }
}
