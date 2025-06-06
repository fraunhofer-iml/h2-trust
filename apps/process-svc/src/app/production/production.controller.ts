import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProcessStepEntity, ProductionMessagePatterns } from '@h2-trust/amqp';
import { CreateProductionDto } from '@h2-trust/api';
import { ProductionService } from './production.service';

@Controller()
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @MessagePattern(ProductionMessagePatterns.CREATE)
  async createProduction(@Payload() payload: { dto: CreateProductionDto }): Promise<ProcessStepEntity[]> {
    return this.service.createProduction(payload.dto);
  }
}
