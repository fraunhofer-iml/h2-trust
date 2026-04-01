/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressPayload {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  constructor(street: string, postalCode: string, city: string, state: string, country: string, id?: string) {
    this.id = id;
    this.street = street;
    this.postalCode = postalCode;
    this.city = city;
    this.state = state;
    this.country = country;
  }
}
