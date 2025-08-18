import { Injectable } from '@nestjs/common';
import { PowerProductionUnitTypeEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PowerProductionUnitTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findPowerProductionUnitTypes(): Promise<PowerProductionUnitTypeEntity[]> {
    return this.prismaService.powerProductionUnitType
      .findMany()
      .then((result) => result.map(PowerProductionUnitTypeEntity.fromDatabase));
  }
}
