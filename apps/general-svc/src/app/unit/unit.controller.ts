import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UnitMessagePatterns } from '@h2-trust/amqp';
import { UnitDto, UnitOverviewDto, UnitType } from '@h2-trust/api';
import { UnitService } from './unit.service';

@Controller()
export class UnitController {
  constructor(private readonly service: UnitService) {}

  @MessagePattern(UnitMessagePatterns.READ)
  async readUnit(@Payload() payload: { id: string }): Promise<UnitDto> {
    return this.service.readUnit(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_ALL)
  async readUnits(@Payload() payload: { companyId: string; unitType: UnitType }): Promise<UnitOverviewDto[]> {
    return this.service.readUnits(payload.companyId, payload.unitType);
  }
}
