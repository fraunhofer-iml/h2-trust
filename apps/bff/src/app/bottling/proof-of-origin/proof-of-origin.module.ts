import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { BottlingSectionService } from './bottling-section.service';
import { EnergySourceClassificationService } from './energy-source-classification.service';
import { HydrogenProductionSectionAssembler } from './hydrogen-production-section.assembler';
import { InputMediaSectionService } from './input-media-section.service';
import { ProcessLineageService } from './process-lineage.service';
import { ProcessStepService } from './process-step.service';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginService } from './proof-of-origin.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  providers: [
    ProofOfOriginService,
    BottlingSectionService,
    HydrogenProductionSectionAssembler,
    InputMediaSectionService,
    ProofOfOriginDtoAssembler,
    EnergySourceClassificationService,
    ProcessStepService,
    ProcessLineageService,
  ],
  exports: [ProofOfOriginService],
})
export class ProofOfOriginModule {}
