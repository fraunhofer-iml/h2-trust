import { formatNumber } from '@angular/common';

export const formatNumberForChart = (value: number | undefined): number => {
  return +formatNumber(value ?? 0, 'en-GB', '1.0-2');
};
