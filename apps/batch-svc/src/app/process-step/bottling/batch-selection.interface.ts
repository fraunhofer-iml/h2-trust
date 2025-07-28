import { BatchEntity, ProcessStepEntity } from '@h2-trust/amqp';

export interface BatchSelection {
  batchesForBottle: BatchEntity[];
  processStepsForRemainingBatchAmount: ProcessStepEntity[];
}
