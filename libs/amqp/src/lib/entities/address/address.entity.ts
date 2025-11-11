/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressDbType } from '@h2-trust/database';

export class AddressEntity {
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;

  constructor(street: string, postalCode: string, city: string, state: string, country: string) {
    this.street = street;
    this.postalCode = postalCode;
    this.city = city;
    this.state = state;
    this.country = country;
  }

  static fromDatabase(address: AddressDbType) {
    return new AddressEntity(
      address.street,
      address.postalCode,
      address.city,
      address.state,
      address.country,
    );
  }
}
