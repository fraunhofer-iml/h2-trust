/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  BrokerException,
  DigitalProductPassportEntity,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import { PowerProductionClass, ProcessType, RfnboType } from '@h2-trust/domain';
import { HydrogenComponentAssembler } from '../process-step/hydrogenComponent/hydrogen-component.assembler';
import { ProcessStepService } from '../process-step/process-step.service';
import { EmissionService } from './proof-of-origin/emission.service';
import { HydrogenBottlingSectionAssembler } from './proof-of-origin/hydrogen-bottling-section.assembler';
import { HydrogenProductionSectionService } from './proof-of-origin/hydrogen-production-section.service';
import { HydrogenStorageSectionAssembler } from './proof-of-origin/hydrogen-storage-section.assembler';
import { HydrogenTransportationSectionAssembler } from './proof-of-origin/hydrogen-transportation-section.assembler';
import { ProvenanceService } from './provenance/provenance.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class DigitalProductPassportService {
  private readonly logger = new Logger(DigitalProductPassportService.name);
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly redComplianceService: RedComplianceService,
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly provenanceService: ProvenanceService,
    private readonly emissionService: EmissionService,
  ) {}

  async determineRfnboTypeForProcessStepId(processStepId: string): Promise<RfnboType> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    return this.determineRfnboTypeForProcessStep(processStep);
  }

  async determineRfnboTypeForProcessStep(processStep: ProcessStepEntity): Promise<RfnboType> {
    const dpp: DigitalProductPassportEntity = await this.readDigitalProductPassport(processStep);
    return dpp.rfnboType ? RfnboType.RFNBO_READY : RfnboType.NON_CERTIFIABLE;
  }

  async readDigitalProductPassportForProcessStepId(processStepId: string): Promise<DigitalProductPassportEntity> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    return this.readDigitalProductPassport(processStep);
  }

  async updateRfnboStatus(processStep: ProcessStepEntity): Promise<{ id: string; batchId: string }> {
    const dpp: DigitalProductPassportEntity = await this.readDigitalProductPassport(processStep);
    this.logger.debug(`Set RFNBO status of process step ${processStep.id} to ${dpp.rfnboType}`);
    return this.processStepService.updateRfnboStatus(processStep, dpp.rfnboType);
  }

  private async readDigitalProductPassport(processStep: ProcessStepEntity): Promise<DigitalProductPassportEntity> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStep);
    const redCompliance: RedComplianceEntity = await this.redComplianceService.determineRedCompliance(
      processStep.id,
      provenance,
    );
    const powerProductionClass: PowerProductionClass =
      DigitalProductPassportService.getPowerProductionClass(provenance);

    const proofOfOrigin: ProofOfOriginSectionEntity[] = [];

    const hydrogenCompositionsForRootOfProvenance: HydrogenComponentEntity[] = await this.calculateHydrogenComposition(
      provenance.root,
    );

    //If the process step is neither hydrogen bottling nor transport, then proof of origin should not be calculated.
    if (processStep.type == ProcessType.HYDROGEN_BOTTLING || processStep.type == ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenCompositionsForBottlingOfProvenance: HydrogenComponentEntity[] = provenance.hydrogenBottling
        ? await this.calculateHydrogenComposition(provenance.hydrogenBottling)
        : [];

      //build hydrogen production section
      if (provenance.powerProductions?.length || provenance.waterConsumptions?.length) {
        const hydrogenProductionSection: ProofOfOriginSectionEntity =
          await this.hydrogenProductionSectionService.buildSection(
            provenance.powerProductions,
            provenance.waterConsumptions,
            provenance.hydrogenBottling.batch.amount,
          );
        proofOfOrigin.push(hydrogenProductionSection);
      }

      //build storage section
      if (provenance.hydrogenProductions?.length) {
        const hydrogenStorageSection: ProofOfOriginSectionEntity = HydrogenStorageSectionAssembler.assembleSection(
          provenance.hydrogenProductions,
        );
        proofOfOrigin.push(hydrogenStorageSection);
      }

      //build bottling section for rootType=HYDROGEN_BOTTLING
      if (provenance.root.type === ProcessType.HYDROGEN_BOTTLING) {
        const hydrogenBottlingSection: ProofOfOriginSectionEntity = HydrogenBottlingSectionAssembler.assembleSection(
          provenance.root,
          hydrogenCompositionsForRootOfProvenance,
        );
        proofOfOrigin.push(hydrogenBottlingSection);
      }

      //build bottling section for rootType=HYDROGEN_TRANSPORTATION
      if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
        const hydrogenBottlingSection: ProofOfOriginSectionEntity = HydrogenBottlingSectionAssembler.assembleSection(
          provenance.hydrogenBottling,
          hydrogenCompositionsForBottlingOfProvenance,
        );
        proofOfOrigin.push(hydrogenBottlingSection);
      }

      //build transport section for rootType=HYDROGEN_TRANSPORTATION
      if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION && provenance.hydrogenBottling) {
        const hydrogenTransportationSection: ProofOfOriginSectionEntity =
          HydrogenTransportationSectionAssembler.assembleSection(
            provenance.root,
            hydrogenCompositionsForBottlingOfProvenance,
          );
        proofOfOrigin.push(hydrogenTransportationSection);
      }
    }

    const proofOfSustainability: ProofOfSustainabilityEntity =
      await this.emissionService.computeProvenanceEmissions(provenance);

    return new DigitalProductPassportEntity(
      processStep.id,
      processStep.endedAt,
      processStep.batch.owner.name ?? '',
      processStep.batch.amount ?? 0,
      processStep.batch.qualityDetails.color ?? '',
      processStep.recordedBy.company.name ?? '',
      hydrogenCompositionsForRootOfProvenance,
      processStep.documents ?? [],
      redCompliance,
      proofOfSustainability,
      proofOfOrigin,
      powerProductionClass,
    );
  }

  private static getPowerProductionClass(provenance: ProvenanceEntity): PowerProductionClass {
    const nonRenewablePowerProductionExits: boolean = provenance.powerProductions
      .map((powerProductions) => powerProductions.batch?.qualityDetails?.powerClass)
      .some((powerClassification) => powerClassification == PowerProductionClass.NOT_RENEWABLE_GRID);
    const renewablePowerProductionExits: boolean = provenance.powerProductions
      .map((powerProductions) => powerProductions.batch?.qualityDetails?.powerClass)
      .some((powerClassification) => powerClassification == PowerProductionClass.RENEWABLE);

    if (nonRenewablePowerProductionExits) {
      return PowerProductionClass.NOT_RENEWABLE_GRID;
    }

    if (renewablePowerProductionExits) {
      return PowerProductionClass.RENEWABLE_GRID;
    }

    return PowerProductionClass.RENEWABLE;
  }

  async calculateHydrogenComposition(processStep: ProcessStepEntity): Promise<HydrogenComponentEntity[]> {
    if (processStep.type === ProcessType.HYDROGEN_BOTTLING || processStep.type === ProcessType.HYDROGEN_PRODUCTION) {
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
