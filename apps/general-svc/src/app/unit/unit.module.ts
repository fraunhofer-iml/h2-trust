import { Module } from '@nestjs/common';
import { PrismaService } from '@h2-trust/database';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

@Module({
  controllers: [UnitController],
  providers: [UnitService, PrismaService],
})
export class UnitModule {}
