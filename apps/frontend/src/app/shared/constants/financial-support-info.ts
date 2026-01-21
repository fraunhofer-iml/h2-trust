/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export const RFNBO_CRITERIA = {
  RENEWABLE_ENERGY: {
    FINANCIAL_SUPPORT: {
      TITLE: 'Financial Support',
      DESCRIPTION: 'Received no financial support in the form of operating subsidies or investment subsidies.',
    },
    GEOGRAPHICAL_CORRELATION: {
      TITLE: 'Geographical Correlation',
      DESCRIPTION: 'Power Production Unit and Hydrogen Production Unit have to be located in the same bidding Zone.',
    },
    TIME_CORRELATION: {
      TITLE: 'Temporal Correlation',
      DESCRIPTION: 'Electricity and hydrogen must be generated within the same hour.',
    },
    ADDITIONALITY_REQUIREMENT: {
      TITLE: 'Additionality',
      DESCRIPTION:
        'The system must not have been in operation for more than 36 months prior to commissioning of the electrolyzer.',
    },
  },
  GRID_ENERGY: {
    CURTAILMENT_AVOIDED: {
      TITLE: 'Avoid curtailment / redispatchment',
      DESCRIPTION: 'Avoid any curtailment  or redispatchment.',
    },
    GRID_GHG_INTENSITY: {
      TITLE: 'GHG intensity',
      DESCRIPTION: 'GHG intensity of grid is 18 g CO2,eq/MJ or less.',
    },
    RENEWABLES_IN_GRID: {
      TITLE: 'Renewables in grid mix',
      DESCRIPTION: '90% or more renewables in grid mix.',
    },
  },
  EMISSION_REDUCTION: {
    TITLE: 'Greenhouse gas emission reduction',
    DESCRIPTION: 'Greenhouse gas emission reduction is larger than 70%.',
  },
};
