import { ElectrolysisType, HydrogenProductionType } from '@h2-trust/api';

export const H2_PRODUCTION_TYPES: Map<HydrogenProductionType, typeof ElectrolysisType> = new Map([
  [HydrogenProductionType.ELECTROLYSIS, ElectrolysisType],
]);
