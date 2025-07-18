import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BottlingMessagePatterns, HydrogenCompositionEntity } from '@h2-trust/amqp';
import { BottlingService } from './bottling.service';

@Controller('bottling')
export class BottlingController {
  constructor(private readonly service: BottlingService) {}

  @MessagePattern(BottlingMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION)
  async calculateHydrogenComposition(bottlingProcessStepId: string): Promise<HydrogenCompositionEntity[]> {
    return this.service.calculateHydrogenComposition(bottlingProcessStepId);
  }
}
