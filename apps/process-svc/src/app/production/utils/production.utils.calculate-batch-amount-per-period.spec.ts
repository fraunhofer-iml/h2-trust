import { ProductionUtils } from './production.utils';

describe('ProductionUtils.calculateBatchAmountPerPeriod', () => {
  it('should return the full amount if numberOfAccountingPeriods is less than 1', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 0.5;

    const expectedAmountPerPeriod = 10;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should divide the amount equally for integer periods', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 2;

    const expectedAmountPerPeriod = 5;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should divide the amount equally for non-integer periods', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 2.2;

    const expectedAmountPerPeriod = 10 / 2.2;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBeCloseTo(expectedAmountPerPeriod);
  });

  it('should return the full amount if numberOfAccountingPeriods is exactly 1', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 1;

    const expectedAmountPerPeriod = 10;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should throw if batchAmount is negative', () => {
    const givenBatchAmount = -10;
    const givenNumberOfAccountingPeriods = 1;

    const expectedErrorMessage = 'batchAmount must be greater than zero';

    expect(() =>
      ProductionUtils.calculateBatchAmountPerPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if batchAmount is zero', () => {
    const givenBatchAmount = 0;
    const givenNumberOfAccountingPeriods = 1;

    const expectedErrorMessage = 'batchAmount must be greater than zero';

    expect(() =>
      ProductionUtils.calculateBatchAmountPerPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if numberOfAccountingPeriods is negative', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = -1;

    const expectedErrorMessage = 'numberOfAccountingPeriods must be greater than zero';

    expect(() =>
      ProductionUtils.calculateBatchAmountPerPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if numberOfAccountingPeriods is zero', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 0;

    const expectedErrorMessage = 'numberOfAccountingPeriods must be greater than zero';

    expect(() =>
      ProductionUtils.calculateBatchAmountPerPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(expectedErrorMessage);
  });
});
