/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export const EmissionStringConstants = {
  CH4_N2O: 'CH₄ & N₂O',
  COMPRESSION: 'Compression from 30 bar to 300 bar',
  DEIONIZED_WATER: 'Deionized Water',
  HYDROGEN_BOTTLING: 'Hydrogen Bottling',
  HYDROGEN_STORAGE: 'Hydrogen Storage',
  HYDROGEN_TRANSPORTATION: 'Hydrogen Transportation',
  HYDROGEN_TRANSPORTATION_PIPELINE: 'Transportation with Pipeline',
  HYDROGEN_TRANSPORTATION_TRAILER: 'Transportation with Trailer',
  POWER_SUPPLY: 'Power Supply',
  WATER_SUPPLY: 'Water Supply',

  PROCESSING: 'Processing',
  SUPPLY_OF_INPUTS: 'Supply of Inputs',
  TRANSPORT_AND_DISTRIBUTION: 'Transport and Distribution',

  TYPES: {
    APPLICATION: 'APPLICATION',
    EPS: 'eps',
    EWS: 'ews',
    EHS: 'ehs',
    EHB: 'ehb',
    EHT: 'eht',

    REGULATORY: 'REGULATORY',
    EI: 'ei',
    EP: 'ep',
    ETD: 'etd',
  },
} as const;
