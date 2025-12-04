import { Inject, Injectable } from '@nestjs/common';
import { BrokerQueues, CreateProductionEntity, HydrogenProductionUnitEntity, PowerProductionUnitEntity, ProcessStepEntity, UnitMessagePatterns } from '@h2-trust/amqp';
import { ClientProxy } from '@nestjs/microservices';
import { ProductionService } from './production.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductionCreationService {
    constructor(
        @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
        private readonly productionService: ProductionService,
    ) { }

    async createProduction(createProductionEntity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
        const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
            this.generalSvc.send(UnitMessagePatterns.READ, { id: createProductionEntity.powerProductionUnitId }),
        );

        const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
            this.generalSvc.send(UnitMessagePatterns.READ, { id: createProductionEntity.hydrogenProductionUnitId }),
        );

        createProductionEntity.hydrogenColor = powerProductionUnit.type.hydrogenColor;
        createProductionEntity.companyIdOfPowerProductionUnit = powerProductionUnit.company.id;
        createProductionEntity.companyIdOfHydrogenProductionUnit = hydrogenProductionUnit.company.id;
        createProductionEntity.waterConsumptionLitersPerHour = hydrogenProductionUnit.waterConsumptionLitersPerHour;


        return this.productionService.createProduction(createProductionEntity);
    }
}
