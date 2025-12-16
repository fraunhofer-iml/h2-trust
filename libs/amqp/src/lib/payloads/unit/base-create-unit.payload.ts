/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AddressPayload } from '../common';

export abstract class BaseCreateUnitPayload {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    mastrNumber!: string;

    @IsOptional()
    @IsString()
    manufacturer?: string;

    @IsOptional()
    @IsString()
    modelType?: string;

    @IsOptional()
    @IsString()
    modelNumber?: string;

    @IsOptional()
    @IsString()
    serialNumber?: string;

    @IsOptional()
    @IsString()
    certifiedBy?: string;

    @IsDate()
    @Type(() => Date)
    commissionedOn!: Date;

    @ValidateNested()
    @Type(() => AddressPayload)
    address!: AddressPayload;

    @IsString()
    @IsNotEmpty()
    companyId!: string; // TODO-MP: should be ownerId

    @IsOptional()
    @IsString()
    operatorId?: string;
}
