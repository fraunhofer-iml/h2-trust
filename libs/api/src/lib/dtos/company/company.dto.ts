/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyEntity } from '@h2-trust/amqp';
import { AddressDto } from '../address';
import { UserDto } from '../user';

export class CompanyDto {
  id: string;
  name: string;
  mastrNumber: string;
  companyType: string;
  address: AddressDto;
  users: UserDto[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    companyType: string,
    address: AddressDto,
    users: UserDto[],
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.companyType = companyType;
    this.address = address;
    this.users = users;
  }

  static fromEntity(company: CompanyEntity): CompanyDto {
    return <CompanyDto>{
      id: company.id,
      name: company.name,
      mastrNumber: company.mastrNumber,
      companyType: company.companyType,
      address: company.address,
      users: company.users,
    };
  }
}
