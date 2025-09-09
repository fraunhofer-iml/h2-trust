import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HydrogenComponentEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { BottlingService } from './bottling/bottling.service';
import { ProcessStepService } from './process-step.service';
import 'multer';
import { TransportationService } from './transportation.service';

@Controller()
export class ProcessStepController {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
    private readonly transportationService: TransportationService,
  ) {}

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL)
  async readProcessSteps(
    @Payload() payload: { processTypes: ProcessType[]; active: boolean; companyId: string },
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessSteps(payload.processTypes, payload.active, payload.companyId);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_UNIQUE)
  async readProcessStep(@Payload() payload: { processStepId: string }): Promise<ProcessStepEntity> {
    return this.processStepService.readProcessStep(payload.processStepId);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE)
  async createProcessStep(@Payload() payload: { processStepEntity: ProcessStepEntity }): Promise<ProcessStepEntity> {
    return this.processStepService.createProcessStep(payload.processStepEntity);
  }

  @MessagePattern(ProcessStepMessagePatterns.HYDROGEN_BOTTLING)
  async createBottlingProcessStep(
    @Payload() payload: { processStepEntity: ProcessStepEntity; files: Express.Multer.File[] },
  ): Promise<ProcessStepEntity> {
    return this.bottlingService.createBottlingProcessStep(payload.processStepEntity, payload.files);
  }

  @MessagePattern(ProcessStepMessagePatterns.HYDROGEN_TRANSPORTATION)
  async createTransportationProcessStep(
    @Payload() payload: { processStepEntity: ProcessStepEntity },
  ): Promise<ProcessStepEntity> {
    return this.transportationService.createTransportationProcessStep(payload.processStepEntity);
  }

  @MessagePattern(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION)
  async calculateHydrogenComposition(bottlingProcessStepId: string): Promise<HydrogenComponentEntity[]> {
    return this.bottlingService.calculateHydrogenComposition(bottlingProcessStepId);
  }
}
