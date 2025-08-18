import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProcessStepService } from './process-step.service';
import { BottlingSectionService } from './bottling-section.service';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { EnergySourceClassificationService } from './energy-source-classification.service';
import { InputMediaSectionService } from './input-media-section.service';
import { ProductionSectionAssembler } from './production-section.assembler';
import { ProofOfOriginService } from './proof-of-origin.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  providers: [
    ProofOfOriginService,
    BottlingSectionService,
    ProductionSectionAssembler,
    InputMediaSectionService,
    ProofOfOriginDtoAssembler,
    EnergySourceClassificationService,
    ProcessStepService,
  ],
  exports: [ProofOfOriginService],
})
export class ProofOfOriginModule {}
