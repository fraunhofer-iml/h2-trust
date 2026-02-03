/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDbBaseType, CompanyDbShallowType, CompanyDbSurfaceType, CompanyDeepDbType } from '@h2-trust/database';
import { AddressEntity } from '../address';
import { PowerAccessApprovalEntity } from '../power-access-approval';
import { UserEntity } from '../user';

export class CompanyEntity {
  id: string;
  name: string;
  mastrNumber: string;
  type: string;
  address: AddressEntity;
  users: UserEntity[];
  hydrogenApprovals: PowerAccessApprovalEntity[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    type: string,
    address: AddressEntity,
    users: UserEntity[],
    hydrogenApprovals: PowerAccessApprovalEntity[],
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.type = type;
    this.address = address;
    this.users = users;
    this.hydrogenApprovals = hydrogenApprovals;
  }

  static fromDeepDatabase(company: CompanyDeepDbType): CompanyEntity {
    return new CompanyEntity(
      company.id,
      company.name,
      company.mastrNumber,
      company.type,
      AddressEntity.fromDatabase(company.address),
      [],
      company.hydrogenApprovals.map((approval) => PowerAccessApprovalEntity.fromShallowDatabase(approval)),
    );
  }

  static fromShallowDatabase(company: CompanyDbShallowType): CompanyEntity {
    return new CompanyEntity(
      company.id,
      company.name,
      company.mastrNumber,
      company.type,
      AddressEntity.fromDatabase(company.address),
      [],
      [],
    );
  }

  static fromSurfaceDatabase(company: CompanyDbSurfaceType): CompanyEntity {
    return new CompanyEntity(
      company.id,
      company.name,
      company.mastrNumber,
      company.type,
      AddressEntity.fromDatabase(company.address),
      [],
      [],
    );
  }

  static fromBaseDatabase(company: CompanyDbBaseType): CompanyEntity {
    return new CompanyEntity(
      company.id,
      company.name,
      company.mastrNumber,
      company.type,
      new AddressEntity('', '', '', '', ''),
      [],
      [],
    );
  }
}
