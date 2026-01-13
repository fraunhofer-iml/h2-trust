import { RedComplianceEntity } from '@h2-trust/amqp';

type RedComplianceEntityOverrides = Partial<Omit<RedComplianceEntity, 'isRedCompliant'>>;

export const RedComplianceEntityFixture = {
  create: (overrides: RedComplianceEntityOverrides = {}): RedComplianceEntity =>
    new RedComplianceEntity(
      overrides.isGeoCorrelationValid ?? true,
      overrides.isTimeCorrelationValid ?? true,
      overrides.isAdditionalityFulfilled ?? true,
      overrides.financialSupportReceived ?? true,
    ),
} as const;
