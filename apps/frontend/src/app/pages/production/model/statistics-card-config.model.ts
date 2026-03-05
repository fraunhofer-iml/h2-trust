import { MeasurementUnit } from '@h2-trust/domain';

export interface StatCardConfig {
  icon: string;
  value: number | undefined;
  unit: MeasurementUnit;
  label: string;
  theme: 'power-total' | 'power-fraction' | 'hydrogen-total' | 'hydrogen-fraction';
}
