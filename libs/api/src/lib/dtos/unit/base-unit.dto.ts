/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressDto } from '../address';

export abstract class BaseUnitDto {
  id: string;
  name: string;
  mastrNumber: string;
  manufacturer: string;
  modelType: string;
  serialNumber: string;
  commissionedOn: Date;
  decommissioningPlannedOn: Date;
  address: AddressDto;
  company: {
    id: string;
    hydrogenApprovals: {
      powerAccessApprovalStatus: string;
      powerProducerId: string;
    }[];
  };

  protected constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressDto,
    company: {
      id: string;
      hydrogenApprovals: {
        powerAccessApprovalStatus: string;
        powerProducerId: string;
      }[];
    },
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.serialNumber = serialNumber;
    this.commissionedOn = commissionedOn;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.address = address;
    this.company = company;
  }
}
