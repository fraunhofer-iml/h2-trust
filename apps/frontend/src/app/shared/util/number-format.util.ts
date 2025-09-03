export const formatNumberForChart = (value: number | undefined): number => {
  return Math.round((value ?? 0) * 100) / 100;
};
