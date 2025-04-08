import { Module } from '@nestjs/common';
import { DatabaseModule } from '@h2-trust/database';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
