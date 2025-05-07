import { BatchEntity } from '@h2-trust/amqp';

export function calculateRemainingAmount(givenBatches: BatchEntity[], amountRequiredForBottle: number) {
  return givenBatches.reduce((sum, batch) => sum + batch.amount, 0) - amountRequiredForBottle;
}
