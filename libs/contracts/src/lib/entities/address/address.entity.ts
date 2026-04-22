/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressDbType } from '@h2-trust/database';

export class AddressEntity {
  id: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;

  constructor(id: string, street: string, postalCode: string, city: string, state: string, country: string) {
    this.id = id;
    this.street = street;
    this.postalCode = postalCode;
    this.city = city;
    this.state = state;
    this.country = country;
  }

  static fromDatabase(address: AddressDbType) {
    return new AddressEntity(
      address.id,
      address.street,
      address.postalCode,
      address.city,
      address.state,
      address.country,
    );
  }
}
