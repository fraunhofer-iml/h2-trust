/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, ProcessType, TransportMode } from '@h2-trust/domain';

export const ProductionErrorMessages = {
  ACCOUNTING_PERIOD_NOT_FINITE: (value: number) => `accountingPeriodInSeconds must be a finite number: ${value}`,
  ACCOUNTING_PERIOD_NOT_POSITIVE: 'accountingPeriodInSeconds must be greater than zero',
  STARTED_AT_NOT_POSITIVE: 'startedAtInSeconds must be positive',
  ENDED_AT_NOT_POSITIVE: 'endedAtInSeconds must be positive',
  ENDED_AT_BEFORE_STARTED_AT: 'endedAtInSeconds must be greater than startedAtInSeconds',
  BATCH_AMOUNT_NOT_POSITIVE: 'batchAmount must be greater than zero',
  NUMBER_OF_PERIODS_NOT_POSITIVE: 'numberOfAccountingPeriods must be greater than zero',
  WATER_CONSUMPTION_NEGATIVE: (value: number) => `waterConsumptionPerHour must be non-negative: [${value}]`,
} as const;

export const TransportationErrorMessages = {
  DISTANCE_REQUIRED_FOR_TRAILER: `Distance is required for transport mode [${TransportMode.TRAILER}].`,
  FUEL_TYPE_REQUIRED_FOR_TRAILER: `Fuel type is required for transport mode [${TransportMode.TRAILER}].`,
  INVALID_TRANSPORT_MODE: (mode: string) => `Invalid transport mode: ${mode}`,
} as const;

export const EmissionErrorMessages = {
  PROVENANCE_UNDEFINED: 'Provenance is undefined.',
  PROVENANCE_MISSING_BOTTLING: 'Provenance is missing hydrogen bottling process step.',
  POWER_UNIT_NOT_FOUND: (unitId: string) => `PowerProductionUnit [${unitId}] not found.`,
  INVALID_PROCESS_TYPE_FOR_POWER_SUPPLY: (type: string) => `Invalid process step type [${type}] for power supply emission calculation`,
  INVALID_PROCESS_TYPE_FOR_WATER_SUPPLY: (type: string) => `Invalid process step type [${type}] for water supply emission calculation`,
  INVALID_PROCESS_TYPE_FOR_HYDROGEN_STORAGE: (type: string) => `Invalid process step type [${type}] for hydrogen storage emission calculation`,
  INVALID_PROCESS_TYPE_FOR_HYDROGEN_BOTTLING: (type: string) => `Invalid process step type [${type}] for hydrogen bottling emission calculation`,
  INVALID_PROCESS_TYPE_FOR_HYDROGEN_TRANSPORTATION: (type: string) => `Invalid process step type [${type}] for hydrogen transportation emission calculation`,
  UNKNOWN_TRANSPORT_MODE: (mode: string, id: string) => `Unknown transport mode [${mode}] for process step [${id}]`,
} as const;

export const ProvenanceErrorMessages = {
  PROCESS_STEP_ID_REQUIRED: 'processStepId must be provided.',
  INVALID_PROCESS_STEP: 'Invalid process step.',
  UNSUPPORTED_PROCESS_TYPE: (type: string) => `Unsupported process type [${type}].`,
} as const;

export const TraversalErrorMessages = {
  EXPECTED_EXACTLY_ONE_BOTTLING: (count: number) => `Expected exactly one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step, but found [${count}].`,
  PROCESS_STEP_COUNT_MISMATCH: (expected: number, actual: number) => `Number of process steps must be [${expected}], but found [${actual}].`,
  NO_PREDECESSORS_FOUND: (id: string) => `No predecessors found for process step [${id}]`,
  PROCESS_STEPS_MISSING: (type: ProcessType) => `Process steps of type [${type}] are missing.`,
  INVALID_PROCESS_STEP_TYPES: (expectedType: ProcessType, invalidSteps: string) => `All process steps must be of type [${expectedType}], but found invalid types: ${invalidSteps}`,
} as const;

export const AccountingPeriodErrorMessages = {
  TIME_FRAME_MISMATCH: 'The data on electricity production and hydrogen production are not in the same time frame.',
  MISSING_PRODUCTION_DATA: (type: BatchType.POWER | BatchType.HYDROGEN) => `Missing ${type} production data`,
  INVALID_UNIT_DATA_RELATION: (type: BatchType.POWER | BatchType.HYDROGEN) => `Invalid unit data relation for ${type} production`,
  NO_GRID_CONNECTION: (id: string) => `No grid connection found for user with id ${id}.`,
} as const;

export const ProcessStepErrorMessages = {
  PREDECESSOR_ID_MISSING: 'ProcessStepId of predecessor is missing.',
  UNEXPECTED_PREDECESSOR_TYPE: (expectedType: ProcessType, actualType: string) => `Expected process type of predecessor to be ${expectedType}, but got ${actualType}.`,
} as const;

export const RedComplianceErrorMessages = {
  PROVENANCE_OR_PRODUCTIONS_MISSING: (id: string) => `Provenance or required productions (power/hydrogen) are missing for processStepId [${id}]`,
  PRODUCTION_UNITS_NOT_FOUND: (powerUnitId: string, hydrogenUnitId: string) => `Production units not found: powerUnitId [${powerUnitId}] or hydrogenUnitId [${hydrogenUnitId}]`,
  INVALID_BIDDING_ZONE: (name: string, zone: unknown) => `Invalid BiddingZone: ${name}: ${zone}`,
} as const;
