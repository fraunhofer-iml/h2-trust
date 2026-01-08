/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDbType } from '@h2-trust/database';
import { AddressEntity } from '../address';
import { UserEntity } from '../user';

export class CompanyEntity {
  id: string;
  name: string;
  mastrNumber: string;
  type: string;
  address: AddressEntity;
  users: UserEntity[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    type: string,
    address: AddressEntity,
    users: UserEntity[],
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.type = type;
    this.address = address;
    this.users = users;
  }

  static fromDatabase(company: CompanyDbType): CompanyEntity {
    return new CompanyEntity(
      company.id,
      company.name,
      company.mastrNumber,
      company.type,
      AddressEntity.fromDatabase(company.address),
      [],
    );
  }
}
