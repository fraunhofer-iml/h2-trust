/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { DigitalProductPassportController } from './digital-product-passport.controller';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { GeneralInformationModule } from './general-information/general-information.module';
import { ProofOfOriginModule } from './proof-of-origin/proof-of-origin.module';
import { ProofOfSustainabilityModule } from './proof-of-sustainability/proof-of-sustainability.module';

@Module({
  imports: [GeneralInformationModule, ProofOfOriginModule, ProofOfSustainabilityModule],
  controllers: [DigitalProductPassportController],
  providers: [DigitalProductPassportService],
})
export class DigitalProductPassportModule {}
