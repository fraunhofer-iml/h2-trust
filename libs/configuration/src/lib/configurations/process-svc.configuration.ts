import { registerAs } from '@nestjs/config';

export const PROCESS_SVC_CONFIGURATION_IDENTIFIER = 'process-configuration';

export interface ProcessSvcConfiguration {
  powerAccountingPeriodInSeconds: number;
  hydrogenAccountingPeriodInSeconds: number;
}

export default registerAs(PROCESS_SVC_CONFIGURATION_IDENTIFIER, () => {
  const powerAccountingPeriodInSeconds = parseInt(process.env['POWER_ACCOUNTING_PERIOD_IN_SECONDS'] || '900', 10);
  const hydrogenAccountingPeriodInSeconds = parseInt(process.env['HYDROGEN_ACCOUNTING_PERIOD_IN_SECONDS'] || '900', 10);

  if (isNaN(powerAccountingPeriodInSeconds) || powerAccountingPeriodInSeconds <= 0) {
    throw new Error('POWER_ACCOUNTING_PERIOD_IN_SECONDS must be a natural number');
  }
  if (isNaN(hydrogenAccountingPeriodInSeconds) || hydrogenAccountingPeriodInSeconds <= 0) {
    throw new Error('HYDROGEN_ACCOUNTING_PERIOD_IN_SECONDS must be a natural number');
  }

  return {
    powerAccountingPeriodInSeconds,
    hydrogenAccountingPeriodInSeconds,
  };
});
