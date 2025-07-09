import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProductionEntity, ProcessStepEntity, ProductionMessagePatterns } from '@h2-trust/amqp';
import { ProductionService } from './production.service';

@Controller()
export class ProductionController {
  constructor(private readonly service: ProductionService) { }

  @MessagePattern(ProductionMessagePatterns.CREATE)
  async createProduction(@Payload() payload: { createProductionEntity: CreateProductionEntity }): Promise<ProcessStepEntity[]> {
    return this.service.createProduction(payload.createProductionEntity);
  }
}
