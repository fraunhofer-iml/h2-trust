import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerException,
  BrokerQueues,
  HydrogenComponentEntity,
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { HydrogenColorDbEnum } from '@h2-trust/database';
import { parseColor } from '@h2-trust/api';

@Injectable()
export class HydrogenCompositionService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async determineHydrogenComposition(processStep: ProcessStepEntity): Promise<HydrogenComponentEntity[]> {
    const color = parseColor(processStep.batch.quality);

    if (color === HydrogenColorDbEnum.GREEN) {
      return [new HydrogenComponentEntity(HydrogenColorDbEnum.GREEN, processStep.batch.amount)];
    }

    const hydrogenStorageUnit: HydrogenStorageUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: processStep.executedBy.id }),
    );
    return this.computeMixedComposition(hydrogenStorageUnit, processStep.batch.amount);
  }

  private computeMixedComposition(
    hydrogenStorageUnit: HydrogenStorageUnitEntity,
    requestedAmount: number,
  ): HydrogenComponentEntity[] {
    const totalStoredAmount = hydrogenStorageUnit.filling.reduce((sum, batch) => sum + batch.amount, 0);
    if (totalStoredAmount <= 0) {
      throw new BrokerException(
`Total stored amount of ${hydrogenStorageUnit.id} is not greater than 0`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return hydrogenStorageUnit.filling.map(
      ({ color, amount }) => new HydrogenComponentEntity(color, (requestedAmount * amount) / totalStoredAmount),
    );
  }
}
