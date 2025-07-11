export class ProductionUtils {
  static calculateNumberOfAccountingPeriods(
    productionStartedAtInSeconds: number,
    productionEndedAtInSeconds: number,
    accountingPeriodInSeconds: number,
  ): number {
    const durationInSeconds = productionEndedAtInSeconds - productionStartedAtInSeconds;

    if (productionStartedAtInSeconds < 0) {
      throw new Error('productionStartedAtInSeconds must be positive');
    }

    if (productionEndedAtInSeconds < 0) {
      throw new Error('productionEndedAtInSeconds must be positive');
    }

    if (accountingPeriodInSeconds <= 0) {
      throw new Error('accountingPeriodInSeconds must be greater than zero');
    }

    if (durationInSeconds <= 0) {
      throw new Error('productionEndedAtInSeconds must be greater than productionStartedAtInSeconds');
    }

    return Math.ceil(durationInSeconds / accountingPeriodInSeconds);
  }

  static calculateBatchAmountPerPeriod(batchAmount: number, numberOfAccountingPeriods: number): number {
    if (batchAmount <= 0) {
      throw new Error('batchAmount must be greater than zero');
    }

    if (numberOfAccountingPeriods <= 0) {
      throw new Error('numberOfAccountingPeriods must be greater than zero');
    }

    return batchAmount / Math.max(1, numberOfAccountingPeriods);
  }


  static calculateProductionStartDate(
    productionStartedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
  ): Date {
    return this.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      false,
    );
  }

  static calculateProductionEndDate(
    productionStartedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
  ): Date {
    return this.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      true,
    );
  }

  static calculateProductionDate(
    productionStartedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
    isEnd: boolean,
  ): Date {
    const productionStartedAtInMs = productionStartedAtInSeconds * 1000;
    const accountingPeriodInMs = accountingPeriodInSeconds * 1000;
    const accountingPeriodOffsetInMs = (accountingPeriodIndex + (isEnd ? 1 : 0)) * accountingPeriodInMs;
    return new Date(
      isEnd
        ? productionStartedAtInMs + accountingPeriodOffsetInMs - 1000 // Subtract 1 second to ensure the end time is before the next period starts
        : productionStartedAtInMs + accountingPeriodOffsetInMs,
    );
  }
}
