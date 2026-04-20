/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDetailsDto } from '..';
import { CompanyType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { CompanyDto } from '../../company';

export const UserDetailsDtoMock: UserDetailsDto[] = [
  <UserDetailsDto>{
    id: '',
    name: '',
    email: '',
    company: <CompanyDto>{
      id: '',
      name: '',
      mastrNumber: '',
      type: CompanyType.POWER_PRODUCER,
      address: <AddressDto>{
        street: '',
        postalCode: '',
        city: '',
        state: '',
        country: '',
      },
      users: [],
    },
  },
];
