/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementEntity } from '@h2-trust/contracts/entities';
import { PowerProductionType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDto } from '../company';
import { PowerProductionOverviewDto } from '../unit';
import { UserDetailsDto } from '../user';

export class PpaRequestDto {
  id: string;
  createdAt: Date;
  status: PowerPurchaseAgreementStatus;
  validFrom: Date;
  validTo: Date;
  sender: UserDetailsDto;
  receiver: CompanyDto;
  powerProductionType: PowerProductionType;
  powerProductionUnit?: PowerProductionOverviewDto;
  decidedAt?: Date;
  decidedBy?: string;
  comment?: string;

  constructor(
    id: string,
    createdAt: Date,
    validFrom: Date,
    validTo: Date,
    sender: UserDetailsDto,
    receiver: CompanyDto,
    powerType: PowerProductionType,
    status: PowerPurchaseAgreementStatus,
    powerProductionUnit?: PowerProductionOverviewDto,
    decidedAt?: Date,
    decidedBy?: string,
    comment?: string,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.decidedAt = decidedAt;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.sender = sender;
    this.receiver = receiver;
    this.powerProductionType = powerType;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.decidedBy = decidedBy;
    this.comment = comment;
  }

  static fromEntity(powerPurchaseAgreement: PowerPurchaseAgreementEntity): PpaRequestDto {
    return <PpaRequestDto>{
      id: powerPurchaseAgreement.id,
      createdAt: powerPurchaseAgreement.createdAt,
      decidedAt: powerPurchaseAgreement.decision?.decidedAt ?? undefined,
      validFrom: powerPurchaseAgreement.validFrom,
      validTo: powerPurchaseAgreement.validTo,
      sender: powerPurchaseAgreement.creator,
      receiver: powerPurchaseAgreement.requestedCompany,
      powerProductionType: powerPurchaseAgreement.suggestedPowerProductionTypeName,
      powerProductionUnit: powerPurchaseAgreement.powerProductionUnit
        ? PowerProductionOverviewDto.fromEntity(powerPurchaseAgreement.powerProductionUnit)
        : undefined,
      status: powerPurchaseAgreement.status,
      decidedBy: powerPurchaseAgreement.decision?.decidingUserName,
      comment: powerPurchaseAgreement.decision?.comment,
    };
  }
}
