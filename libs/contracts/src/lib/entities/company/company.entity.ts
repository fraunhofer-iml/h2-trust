/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDbBaseType, CompanyDeepDbType, CompanyFlatDbType, CompanyNestedDbType } from '@h2-trust/database';
import { CompanyType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';
import { AddressEntity } from '../address';
import { PowerPurchaseAgreementEntity } from '../power-purchase-agreement';
import { UserEntity } from '../user';

export class CompanyEntity {
  id: string;
  name: string;
  mastrNumber: string;
  type: CompanyType;
  address: AddressEntity;
  users: UserEntity[];
  hydrogenAgreements: PowerPurchaseAgreementEntity[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    type: CompanyType,
    address: AddressEntity,
    users: UserEntity[],
    hydrogenAgreements: PowerPurchaseAgreementEntity[],
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.type = type;
    this.address = address;
    this.users = users;
    this.hydrogenAgreements = hydrogenAgreements;
  }

  static fromDeepDatabase(company: CompanyDeepDbType): CompanyEntity {
    assertValidEnum(company.type, CompanyType, 'CompanyType');
    return new CompanyEntity(
      company.id,
      company.name,
      company.mastrNumber,
      company.type,
      AddressEntity.fromDatabase(company.address),
      [],
      company.hydrogenAgreements.map((agreement) => PowerPurchaseAgreementEntity.fromNestedDatabase(agreement)),
    );
  }

  static fromNestedDatabase(company: CompanyNestedDbType): CompanyEntity {
    assertValidEnum(company.type, CompanyType, 'CompanyType');
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

  static fromFlatDatabase(company: CompanyFlatDbType): CompanyEntity {
    assertValidEnum(company.type, CompanyType, 'CompanyType');
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

  static fromBaseType(company: CompanyDbBaseType): CompanyEntity {
    assertValidEnum(company.type, CompanyType, 'CompanyType');
    return new CompanyEntity(
      company.id,
      company.name,
      company.mastrNumber,
      company.type,
      new AddressEntity('', '', '', '', '', ''),
      [],
      [],
    );
  }
}
