/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyEntity } from '../company';
import { UserEntity } from './user.entity';

export class UserDetailsEntity extends UserEntity {
  company: CompanyEntity;

  constructor(id: string, name: string, email: string, company: CompanyEntity) {
    super(id, name, email);
    this.company = company;
  }
}
