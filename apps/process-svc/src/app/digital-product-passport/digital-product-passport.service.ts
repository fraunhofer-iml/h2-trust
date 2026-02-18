/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BrokerException,
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
  GridEnergyRfnboDto,
  HydrogenComponentDto,
  ProofOfSustainabilityDto,
  RenewableEnergyRfnboDto,
  RfnboBaseDto,
  SectionDto,
} from '@h2-trust/api';
import { HydrogenColor, ProcessType, RFNBOType } from '@h2-trust/domain';
import { HydrogenComponentAssembler } from '../process-step/hydrogenComponent/hydrogen-component.assembler';
import { ProcessStepService } from '../process-step/process-step.service';
import { EmissionService } from './proof-of-origin/emission.service';
import { HydrogenBottlingSectionService } from './proof-of-origin/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './proof-of-origin/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './proof-of-origin/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './proof-of-origin/hydrogen-transportation-section.service';
import { ProvenanceService } from './provenance/provenance.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly redComplianceService: RedComplianceService,
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly provenanceService: ProvenanceService,
    private readonly emissionService: EmissionService,
  ) {}

  async getRfnboType(processStepId: string): Promise<RFNBOType> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStep);
    const rfnbo: RfnboBaseDto = await this.getRfnboCompliance(processStep.id, provenance);
    return rfnbo.rfnboReady ? RFNBOType.RFNBO_READY : RFNBOType.NON_CERTIFIABLE;
  }

  private async getRfnboCompliance(
    processStepId: string,
    provenance: ProvenanceEntity,
  ): Promise<RenewableEnergyRfnboDto> {
    const redCompliance: RedComplianceEntity = await this.redComplianceService.determineRedCompliance(
      processStepId,
      provenance,
    );
    const proofOfSustainability: ProofOfSustainabilityEntity =
      await this.emissionService.computeProvenanceEmissions(provenance);
    const isEmissionReductionAbove70Percent = proofOfSustainability.emissionReductionPercentage > 70;
    return new RenewableEnergyRfnboDto(
      isEmissionReductionAbove70Percent,
      redCompliance.isGeoCorrelationValid,
      redCompliance.isTimeCorrelationValid,
      redCompliance.isAdditionalityFulfilled,
      redCompliance.financialSupportReceived,
    );
  }

  async addRfnboTypeToProcessStepList(processSteps: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    for (let i: number = 0; i < processSteps.length; i++) {
      const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processSteps[i]);
      const rfnbo: RfnboBaseDto = await this.getRfnboCompliance(processSteps[i].id, provenance);
      processSteps[i].batch.rfnbo = rfnbo.rfnboReady ? RFNBOType.RFNBO_READY : RFNBOType.NON_CERTIFIABLE;
    }
    return processSteps;
  }

  async readDigitalProductPassport(processStepId: string): Promise<DigitalProductPassportDto> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStep);
    let rfnboCompliance: RfnboBaseDto = await this.getRfnboCompliance(processStepId, provenance);

    //the hydrogen composition of the provenance root and the hydrogen composition of the processStep are the same
    const hydrogenCompositionsForRootOfProvenence: HydrogenComponentEntity[] = await this.calculateHydrogenComposition(
      provenance.root,
    );

    const hydrogenCompositionsForBottlingOfProvenence: HydrogenComponentEntity[] = provenance.hydrogenBottling
      ? await this.calculateHydrogenComposition(provenance.hydrogenBottling)
      : [];

    const hydrogenCompositionDtos: HydrogenComponentDto[] = hydrogenCompositionsForRootOfProvenence.map((hc) =>
      HydrogenComponentDto.fromEntity(hc),
    );
    const gridPowerUsed = hydrogenCompositionsForRootOfProvenence.find(
      (element: HydrogenComponentDto) => element.color === HydrogenColor.YELLOW,
    );

    rfnboCompliance = gridPowerUsed
      ? new GridEnergyRfnboDto(rfnboCompliance.emissionReductionOver70Percent, false, false, false)
      : rfnboCompliance;

    const proofOfOrigin: ProofOfOriginSectionEntity[] = [];

    //hydrogen Production Section
    if (provenance.powerProductions?.length || provenance.waterConsumptions?.length) {
      const hydrogenProductionSection: ProofOfOriginSectionEntity =
        await this.hydrogenProductionSectionService.buildSection(
          provenance.powerProductions,
          provenance.waterConsumptions,
          provenance.hydrogenBottling.batch.amount,
        );
      proofOfOrigin.push(hydrogenProductionSection);
    }

    //build Storage Section
    if (provenance.hydrogenProductions?.length) {
      const hydrogenStorageSection: ProofOfOriginSectionEntity = HydrogenStorageSectionService.buildSection(
        provenance.hydrogenProductions,
      );
      proofOfOrigin.push(hydrogenStorageSection);
    }

    //build Bottling Section for an rootType=HYDROGEN_BOTTLING
    if (provenance.root.type === ProcessType.HYDROGEN_BOTTLING) {
      const hydrogenBottlingSection: ProofOfOriginSectionEntity = HydrogenBottlingSectionService.buildSection(
        provenance.root,
        hydrogenCompositionsForRootOfProvenence,
      );
      proofOfOrigin.push(hydrogenBottlingSection);
    }

    //build Bottling Section for an rootType=HYDROGEN_TRANSPORTATION
    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenBottlingSection: ProofOfOriginSectionEntity = HydrogenBottlingSectionService.buildSection(
        provenance.hydrogenBottling,
        hydrogenCompositionsForBottlingOfProvenence,
      );
      proofOfOrigin.push(hydrogenBottlingSection);
    }

    //build Transport Section for an rootType=HYDROGEN_TRANSPORTATION
    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION && provenance.hydrogenBottling) {
      const hydrogenTransportationSection: ProofOfOriginSectionEntity =
        HydrogenTransportationSectionService.buildSection(provenance.root, hydrogenCompositionsForBottlingOfProvenence);
      proofOfOrigin.push(hydrogenTransportationSection);
    }

    //TODO-LG: compute provenance emissions should be evaluated and be made more compact if that is possible
    const proofOfSustainability: ProofOfSustainabilityEntity =
      await this.emissionService.computeProvenanceEmissions(provenance);

    const attachedFiles = (processStep.documents ?? []).map(
      (document) => new FileInfoDto(document.fileName, `${document.storageUrl}`),
    );

    const proofOfSustainabilityDto = ProofOfSustainabilityDto.fromEntity(proofOfSustainability);
    const proofOfOriginDto = SectionDto.fromEntities(proofOfOrigin);

    return new DigitalProductPassportDto(
      processStep.id,
      processStep.endedAt,
      processStep.batch.owner.name ?? '',
      processStep.batch.amount ?? 0,
      processStep.batch.qualityDetails.color ?? '',
      processStep.recordedBy.company.name ?? '',
      hydrogenCompositionDtos,
      attachedFiles,
      rfnboCompliance,
      proofOfSustainabilityDto,
      proofOfOriginDto,
    );
  }

  private async calculateHydrogenComposition(processStep: ProcessStepEntity): Promise<HydrogenComponentEntity[]> {
    if (processStep.type === ProcessType.HYDROGEN_BOTTLING) {
      return HydrogenComponentAssembler.assemble(processStep);
    }

    const predecessorId: string = processStep.batch?.predecessors[0]?.processStepId;

    if (!predecessorId) {
      throw new BrokerException(
        `Process step ${processStep.id} has no predecessor to derive composition from`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const predecessor: ProcessStepEntity = await this.processStepService.readProcessStep(predecessorId);

    if (predecessor.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new BrokerException(
        `Predecessor process step ${predecessor.id} is not of type ${ProcessType.HYDROGEN_BOTTLING}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return HydrogenComponentAssembler.assemble(predecessor);
  }
}
