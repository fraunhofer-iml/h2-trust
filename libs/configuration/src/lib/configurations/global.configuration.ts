/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { requireEnv } from '../util';
import {
  buildVerificationConfiguration,
  S3Configuration,
  VerificationConfiguration,
} from './features/verification.configuration';

export const GLOBAL_CONFIGURATION_IDENTIFIER = 'global-configuration';

export interface GlobalConfiguration {
  logLevel: LogLevel[];
  amqp: AmqpConfiguration;
  centralizedStorage: CentralizedStorageConfiguration;
  keycloak: KeycloakConfiguration;
  featureFlags: FeatureFlagsConfiguration;
  verification?: VerificationConfiguration;
}

export interface AmqpConfiguration {
  uri: string;
  queuePrefix: string;
}

export type CentralizedStorageConfiguration = S3Configuration;

export interface KeycloakConfiguration {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}

export interface FeatureFlagsConfiguration {
  verificationEnabled: boolean;
}

export default registerAs(GLOBAL_CONFIGURATION_IDENTIFIER, () => {
  const verificationEnabled = requireEnv('FEATURE_VERIFICATION_ENABLED') === 'true';

  return {
    logLevel: requireEnv('LOG_LEVEL').split(','),
    amqp: {
      uri: requireEnv('AMQP_URI'),
      queuePrefix: requireEnv('AMQP_QUEUE_PREFIX'),
    } satisfies AmqpConfiguration,
    centralizedStorage: {
      endpointUrl: requireEnv('CENTRALIZED_STORAGE_ENDPOINT_URL'),
      region: requireEnv('CENTRALIZED_STORAGE_REGION'),
      accessKey: requireEnv('CENTRALIZED_STORAGE_ACCESS_KEY'),
      secretKey: requireEnv('CENTRALIZED_STORAGE_SECRET_KEY'),
      bucketName: requireEnv('CENTRALIZED_STORAGE_BUCKET_NAME'),
    } satisfies CentralizedStorageConfiguration,
    keycloak: {
      url: requireEnv('KEYCLOAK_URL'),
      realm: requireEnv('KEYCLOAK_REALM'),
      clientId: requireEnv('KEYCLOAK_CLIENT_ID'),
      clientSecret: requireEnv('KEYCLOAK_CLIENT_SECRET'),
    } satisfies KeycloakConfiguration,
    featureFlags: {
      verificationEnabled,
    } satisfies FeatureFlagsConfiguration,
    verification: verificationEnabled ? buildVerificationConfiguration() : undefined,
  };
});
