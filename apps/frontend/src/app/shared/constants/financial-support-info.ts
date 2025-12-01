/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export const RED_III_CRITERIA = {
  FINANCIAL_SUPPORT: {
    TITLE: 'Financial Support',
    DESCRIPTION: 'Received no financial support in the form of operating subsidies or investment subsidies.',
  },
  GEOGRAPHICAL_CORRELATION: {
    TITLE: 'Geographical Correlation',
    DESCRIPTION: 'Power Production Unit and Hydrogen Production Unit have to be located in the same bidding Zone.',
  },
  TIME_CORRELATION: {
    TITLE: 'Time Correlation',
    DESCRIPTION: 'Electricity and hydrogen must be generated within the same hour.',
  },
  ADDITIONALITY_REQUIREMENT: {
    TITLE: 'Additionality Requirement',
    DESCRIPTION:
      'The system must not have been in operation for more than 36 months prior to commissioning of the electrolyzer.',
  },
};
