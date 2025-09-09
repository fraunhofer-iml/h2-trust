import { Injectable } from '@nestjs/common';
import { PowerProductionTypeEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PowerProductionTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.prismaService.powerProductionType
      .findMany()
      .then((result) => result.map(PowerProductionTypeEntity.fromDatabase));
  }
}
