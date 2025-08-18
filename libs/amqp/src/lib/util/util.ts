export class Util {
  static sumAmounts(arrayWithAmount: { amount: number }[]): number {
    return arrayWithAmount.reduce((sum, item) => sum + item.amount, 0);
  }
}
