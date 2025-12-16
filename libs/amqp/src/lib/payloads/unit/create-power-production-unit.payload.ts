/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { BiddingZone, GridLevel, PowerProductionType } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreatePowerProductionUnitPayload extends BaseCreateUnitPayload {
    @IsString()
    @IsNotEmpty()
    electricityMeterNumber!: string;

    @IsOptional()
    @IsString()
    gridOperator?: string;

    @IsOptional()
    @IsString()
    gridConnectionNumber?: string;

    @IsEnum(GridLevel)
    gridLevel!: GridLevel;

    @IsEnum(BiddingZone)
    biddingZone!: BiddingZone;

    @IsNumber()
    @IsPositive()
    ratedPower!: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    decommissioningPlannedOn?: Date;

    @IsBoolean()
    financialSupportReceived!: boolean;

    @IsEnum(PowerProductionType)
    powerProductionType!: PowerProductionType; // TODO-MP: rename to type

    static of(
        name: string,
        mastrNumber: string,
        commissionedOn: Date,
        address: AddressPayload,
        companyId: string,
        electricityMeterNumber: string,
        ratedPower: number,
        gridLevel: GridLevel,
        biddingZone: BiddingZone,
        financialSupportReceived: boolean,
        powerProductionType: PowerProductionType,
        manufacturer?: string,
        modelType?: string,
        modelNumber?: string,
        serialNumber?: string,
        certifiedBy?: string,
        operatorId?: string,
        decommissioningPlannedOn?: Date,
        gridOperator?: string,
        gridConnectionNumber?: string,
    ): CreatePowerProductionUnitPayload {
        return {
            name,
            mastrNumber,
            commissionedOn,
            address,
            companyId,
            electricityMeterNumber,
            ratedPower,
            gridLevel,
            biddingZone,
            financialSupportReceived,
            powerProductionType,
            manufacturer,
            modelType,
            modelNumber,
            serialNumber,
            certifiedBy,
            operatorId,
            decommissioningPlannedOn,
            gridOperator,
            gridConnectionNumber,
        };
    }
}
