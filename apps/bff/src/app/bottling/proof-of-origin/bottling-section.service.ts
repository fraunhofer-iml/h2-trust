import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BottlingMessagePatterns, BrokerQueues, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';


@Injectable()
export class BottlingSectionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processService: ClientProxy,
  ) {}

  async buildBottlingSection(processStepEntity: ProcessStepEntity): Promise<SectionDto> {
    const hydrogenComposition = await this.fetchHydrogenComposition(processStepEntity);
    return new SectionDto(
      ProofOfOriginConstants.BOTTLING_SECTION_NAME,
      [ProofOfOriginDtoAssembler.assembleBottlingHydrogenBatchDto(processStepEntity, hydrogenComposition)],
      [],
    );
  }

  private async fetchHydrogenComposition(processStepEntity: ProcessStepEntity): Promise<HydrogenComponentEntity[]> {
    return firstValueFrom(
      this.processService.send(BottlingMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, processStepEntity.id),
    );
  }
}
